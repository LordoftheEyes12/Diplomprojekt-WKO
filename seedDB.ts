import { DB } from 'https://deno.land/x/sqlite/mod.ts';
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const modelDB = new DB('models.db');


export async function seedDB() {
    await populate();
    return "Database seeded";
}


function addModel(model: string, provider: string)
{
  const hit = modelDB.query(`INSERT INTO models (modelName, provider) VALUES ('${model}', '${provider}')`);
  console.log(hit);
  const check = modelDB.query(`SELECT provider, modelName FROM models WHERE modelName = '${model}'`);
  console.log(check);

  return check;
}


async function populate(){
    let errorcount = 0;
    const models: model[] = [];
    try{
    const oaApiKey = Deno.env.get("OA_API_KEY");
    const oaApiUrl = Deno.env.get("OA_API_URL");
    const oaReqUrl = oaApiUrl + "/v1/models";
    const oaResponse1 = await fetch(oaReqUrl, { method: "GET", headers: {"Authorization": `Bearer ${oaApiKey}`}});
    const oaResponse = await oaResponse1.json();
    for (const model of oaResponse.data){
      models.push({modelName: model.id, provider: "OA"});
      try{
        addModel(model.id, "OA");
      }
        catch(_e){
            errorcount++;
            continue;
        }
    }
    const olApiUrl = Deno.env.get("OL_API_URL");
    const olReqUrl = olApiUrl + "/api/tags";
    const olResponse1 = await fetch(olReqUrl);
    const olResponse = await olResponse1.json();
    for (const model of olResponse.models){
      models.push({modelName: model.name, provider: "OL"});
      try{
        addModel(model.name, "OL");
      }
        catch(_e){
            
            errorcount++;
             continue;
        }
    }}
    catch(e){
      console.log(e);
    }
    finally{
      //console.log(models);
      console.log(`Error count: ${errorcount}`);
      //console.log(JSON.stringify(models));
      
    }
  }

  
type model ={
    modelName: string,
    provider: string
  }