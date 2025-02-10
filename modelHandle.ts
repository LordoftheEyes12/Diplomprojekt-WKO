import { DB } from 'https://deno.land/x/sqlite/mod.ts';
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const modelDB = new DB("models.db");


export function setModel(model:string)
{
    const provider = checkProvider(model);
     if (provider === "Model not found"){
       return "Model not found";
     }
    
     if (provider[0] == "OA"){
       Deno.env.set("OA_MODEL", model);
       Deno.env.set("API_PROVIDER", "OA");
       return `Model set to ${model} from OpenAI`;
     }
     else if (provider[0] == "OL"){
       Deno.env.set("OL_MODEL", model);
       Deno.env.set("API_PROVIDER", "OL");
       return `Model set to ${model} from OLLAMA`;
     }
   
}

export function changeProvider(provider: string){
    if (provider == "OA" || provider == "OL"){
      Deno.env.set("API_PROVIDER", provider);
      return JSON.stringify({provider});
    } 
    else{
      return JSON.stringify({provider: "No Provider"});
    }
    
  }
   
function checkProvider(model:string)
{
  let find = modelDB.query(`SELECT provider FROM models WHERE modelName = '${model}'`);
    if (find.length === 0){
      find = modelDB.query(`SELECT provider FROM models WHERE modelName = '${model}:latest'`);
      return "Model not found";
    }
  return find;
}
  
export async function populateDB(){
    let errorcount = 0;
    const models: model[] = [];
    modelDB.execute("CREATE TABLE IF NOT EXISTS models (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, modelName TEXT, provider TEXT); ")
    try{
        try{
        const oaApiKey = Deno.env.get("OA_API_KEY");
        const oaApiUrl = Deno.env.get("OA_API_URL");
        const oaReqUrl = oaApiUrl + "/v1/models";
        const oaResponse1 = await fetch(oaReqUrl, { method: "GET", headers: {"Authorization": `Bearer ${oaApiKey}`}});
        const oaResponse = await oaResponse1.json();
        for (const model of oaResponse.data){
            models.push({modelName: model.id, provider: "OA"});
            try
            {
                addModel(model.id, "OA");
            }
            catch(_e)
            {
                errorcount++;
                continue;
            }
        }}
        catch(e){
          console.log(e);
        }
        try{
        const olApiUrl = Deno.env.get("OL_API_URL");
        const olReqUrl = olApiUrl + "/api/tags";
        const olResponse1 = await fetch(olReqUrl);
        const olResponse = await olResponse1.json();
        for (const model of olResponse.models)
        {
            console.log(model.name);
            models.push({modelName: model.name, provider: "OL"});
            try
            {
                addModel( model.name.replace(/:latest$/, ''), "OL");
            }
            catch(_e){
                errorcount++;
                continue;
            }
        }
      }catch(e){
        console.log(e);
      }
    }
    catch(e)
    {
        console.log(e);
    }
    finally
    {
        console.log(`Error count: ${errorcount}`);
   
    }
  }

  
type model ={
    modelName: string,
    provider: string
}

function addModel(model: string, provider: string)
{
  const hit = modelDB.query(`INSERT INTO models (modelName, provider) VALUES ('${model}', '${provider}')`);
  console.log(hit);
  const check = modelDB.query(`SELECT provider, modelName FROM models WHERE modelName = '${model}'`);
  console.log(check);

  return check;
}

export async function listModels(){
  const models: model[] = [];
  try{
    try{
    const oaApiKey = Deno.env.get("OA_API_KEY");
    const oaApiUrl = Deno.env.get("OA_API_URL");
    const oaReqUrl = oaApiUrl + "/v1/models";
  const oaResponse1 = await fetch(oaReqUrl, { method: "GET", headers: {"Authorization": `Bearer ${oaApiKey}`}});
  const oaResponse = await oaResponse1.json();
  for (const model of oaResponse.data){
    models.push({modelName: model.id, provider: "OA"});
  }}
  catch(e){
    console.log(e);
  }
  try{
  const olApiUrl = Deno.env.get("OL_API_URL");
  const olReqUrl = olApiUrl + "/api/tags";
  const olResponse1 = await fetch(olReqUrl);
  const olResponse = await olResponse1.json();
  for (const model of olResponse.models){
    models.push({modelName: model.name.replace(/:latest$/, ''), provider: "OL"});
  }}
  catch(e){
    console.log(e);
  }
}
  
  catch(e){
    console.log(e);
  }
  
  return JSON.stringify(models);
}

export async function getModels(){
    return await listModels();
  }