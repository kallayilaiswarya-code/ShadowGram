from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np, networkx as nx
from sklearn.ensemble import IsolationForest
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="ShadowGram API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ACCOUNTS = [
 {"id":"A01","name":"@orbit_anna","group":"organic","typing":4.1,"hesitation":1.8,"mouse":.72,"nav":.91,"start":20.2,"end":23.0,"interval":48,"content":"Weekend photography tips and city walks","env":"env-a"},
 {"id":"A02","name":"@greenfield","group":"organic","typing":5.0,"hesitation":1.4,"mouse":.58,"nav":.64,"start":9.1,"end":17.2,"interval":130,"content":"Healthy recipes and gardening notes","env":"env-b"},
 {"id":"A03","name":"@pixel_moon","group":"organic","typing":3.7,"hesitation":2.3,"mouse":.81,"nav":.73,"start":18.4,"end":22.1,"interval":71,"content":"Indie games and illustration sketches","env":"env-c"},
 {"id":"A04","name":"@northstar","group":"organic","typing":4.6,"hesitation":1.9,"mouse":.49,"nav":.61,"start":7.5,"end":15.0,"interval":205,"content":"Learning Python and data visualization","env":"env-d"},
 {"id":"A05","name":"@chaiandcode","group":"organic","typing":4.0,"hesitation":2.0,"mouse":.67,"nav":.79,"start":19.2,"end":22.8,"interval":84,"content":"Coffee, coding and college projects","env":"env-e"},
 {"id":"A06","name":"@deal_drop","group":"coordinated","typing":4.21,"hesitation":1.71,"mouse":.71,"nav":.92,"start":20.48,"end":23.08,"interval":47,"content":"Limited offer claim your reward now verify your account","env":"env-shadow"},
 {"id":"A07","name":"@bonus_hub","group":"coordinated","typing":4.18,"hesitation":1.69,"mouse":.70,"nav":.93,"start":20.51,"end":23.05,"interval":49,"content":"Claim your reward now and verify your account for this limited offer","env":"env-shadow"},
 {"id":"A08","name":"@quick_claim","group":"coordinated","typing":4.23,"hesitation":1.73,"mouse":.72,"nav":.91,"start":20.46,"end":23.10,"interval":48,"content":"Verify your account to claim this limited reward offer now","env":"env-shadow"},
 {"id":"A09","name":"@night_signal","group":"outlier","typing":8.8,"hesitation":.4,"mouse":.18,"nav":.22,"start":2.0,"end":4.0,"interval":12,"content":"Late night market monitoring","env":"env-x"},
 {"id":"A10","name":"@market_farm","group":"suspicious","typing":4.5,"hesitation":1.5,"mouse":.55,"nav":.86,"start":20.0,"end":23.2,"interval":52,"content":"Today offer promotion and discount discussion","env":"env-y"},
]

def numeric(a):
    return [a[k] for k in ["typing","hesitation","mouse","nav","start","end","interval"]]

def sim(a,b):
    # Normalize heterogeneous behavioral dimensions and compare.
    X=np.array([numeric(a),numeric(b)],dtype=float)
    mu=X.mean(0); sd=X.std(0); sd[sd==0]=1
    z=(X-mu)/sd
    s=float(cosine_similarity(z)[0,1])
    # Content similarity: deterministic TF-IDF-style token Jaccard fallback for offline demo.
    ta=set(a["content"].lower().split()); tb=set(b["content"].lower().split())
    content=len(ta&tb)/max(1,len(ta|tb))
    timing=max(0.0,1-abs(a["start"]-b["start"])/3)
    nav=max(0.0,1-abs(a["nav"]-b["nav"]))
    typing=max(0.0,1-abs(a["typing"]-b["typing"])/2)
    interval=max(0.0,1-abs(a["interval"]-b["interval"])/100)
    env=1.0 if a["env"]==b["env"] else 0.0
    signals={"typing":typing,"navigation":nav,"timing":timing,"posting_interval":interval,"content":content,"environment":env}
    # Five-signal composite, intentionally explainable.
    score=.20*typing+.18*nav+.20*timing+.17*interval+.20*content+.05*env
    return score,signals

def analysis():
    X=np.array([numeric(a) for a in ACCOUNTS])
    iso=IsolationForest(random_state=42, contamination=.2).fit(X)
    anomaly=iso.decision_function(X)
    G=nx.Graph()
    G.add_nodes_from(a["id"] for a in ACCOUNTS)
    edges=[]
    for i,a in enumerate(ACCOUNTS):
        for b in ACCOUNTS[i+1:]:
            score,signals=sim(a,b)
            strong=sum(v>=.78 for k,v in signals.items() if k!="environment")
            if score>=.78 and strong>=3:
                G.add_edge(a["id"],b["id"],weight=round(score,3),signals=signals)
                edges.append({"source":a["id"],"target":b["id"],"score":round(score,3),"signals":signals})
    clusters=[sorted(c) for c in nx.connected_components(G) if len(c)>1]
    return anomaly,edges,clusters

@app.get("/api/health")
def health(): return {"status":"ok","service":"shadowgram"}

@app.get("/api/accounts")
def accounts():
    anomaly,_,_=analysis()
    return [{"id":a["id"],"name":a["name"],"group":a["group"],"anomaly":round(float(-anomaly[i]),3)} for i,a in enumerate(ACCOUNTS)]

@app.get("/api/analysis")
def full_analysis():
    anomaly,edges,clusters=analysis()
    return {
        "accounts":ACCOUNTS,
        "edges":edges,
        "clusters":clusters,
        "summary":{
            "accounts_analyzed":len(ACCOUNTS),
            "shadow_clusters":len(clusters),
            "linked_accounts":sum(len(c) for c in clusters),
            "method":"Multi-signal deterministic behavioral correlation"
        }
    }

@app.get("/api/evidence/{source}/{target}")
def evidence(source:str,target:str):
    a=next(x for x in ACCOUNTS if x["id"]==source); b=next(x for x in ACCOUNTS if x["id"]==target)
    score,signals=sim(a,b)
    reasons=[]
    labels={"typing":"typing cadence","navigation":"navigation pattern","timing":"active-hour timing","posting_interval":"posting interval","content":"content similarity","environment":"environment"}
    for k,v in sorted(signals.items(), key=lambda x:x[1], reverse=True):
        if v>=.78: reasons.append({"signal":labels[k],"value":round(v,2),"explanation":f"Strong correlation ({v:.0%}) across this signal."})
    return {"source":a["name"],"target":b["name"],"score":round(score,2),"statement":"Signals consistent with coordinated operation; this does not identify a person.","reasons":reasons}
