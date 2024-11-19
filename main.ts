import { MongoClient, MongoCompatibilityError, ObjectId } from "mongodb";
import { TareaModel } from "./tps.ts";
import { fromModelToTarea } from "./utls.ts";

const mongo_url = "mongodb+srv://examen:nebrija@cluster0.h7shi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//const mongo_url = Deno.env.get("MONGO_URL");
/*if(!mongo_url){
    console.error("Url no encontrada");
    Deno.exit(1);
}*/

const client = new MongoClient(mongo_url);
await client.connect();
console.info("DB connected");

const db = client.db("Practica3");
const tareaColletion = db.collection<TareaModel>("Tareas");

const handler = async (req: Request): Promise<Response> => {
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;

    if(method === "GET"){
        if(path === "/tasks"){
            
            const tareaDB = await tareaColletion.find().toArray();
            console.log(tareaColletion);
            const tareas = tareaDB.map((e) => fromModelToTarea(e));
            return new Response(JSON.stringify(tareas), {status: 200});

        } else if(path.startsWith('/tasks/')){
            const id = (path.split("/",3));
            const aux = id[2];

            const tareas = await tareaColletion
            .find({ _id: new ObjectId(aux)})
            .toArray();

            if(tareas.length === 0){
                return new Response("Tarea no encontrada", {status: 400})
            }

            return new Response(JSON.stringify(tareas), {status: 200});
        }

    } else if(method === "POST"){
        if(path === "/tasks"){
            const body = await req.json();

            if(!body.title){
                return new Response("Bad request", {status: 400});
            }

            const e = await tareaColletion.findOne({title: body.title});
            if(e){
                return new Response("Libro existente", {status: 400});
            }

            const {insertedId} = await tareaColletion.insertOne({
                title: body.title,
                completed: false
            });

            return new Response(JSON.stringify({
                id: insertedId,
                title: body.title,
                completed: false
            }),
        {status: 201});

        }
    }else if(method === "PUT"){
        if(path.startsWith('/tasks/')){
            const id = (path.split("/",3));
            const aux = id[2];

            const body = await req.json();

            const {modifiedCount} = await tareaColletion.updateOne(
                {_id: new ObjectId(aux)},
                {$set: {completed: body.completed}}
            )

            if(modifiedCount === 0){
                return new Response("Ningun libro actualizado", {status: 404});
            }

            return new Response(JSON.stringify({
                id: aux,
                title: body.title,
                completed: false
            }),
        {status: 201});
        }
    } else if(method === "DELETE"){
        if(path.startsWith('/tasks/')){
            const id = (path.split("/",3));
            const aux = id[2];

            const tarea = await tareaColletion
            .findOne({ _id: new ObjectId(aux)})

            if(!tarea){
                return new Response("Tarea no encontrada", {status: 404});
            }

            const {deletedCount} = await tareaColletion.deleteOne({
                _id: new ObjectId(aux),
            })

            if(deletedCount === 0){
                return new Response("Tarea eliminada correctamente", {status: 200});
            }
        }
    }

    return new Response("Endpoint not found!", {status: 404});
}

Deno.serve({port: 3000}, handler);