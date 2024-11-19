import {type OptionalId } from "mongodb";

export type TareaModel = OptionalId<{
    title: string,
    completed: boolean
}>

export type Tarea = {
    id: string,
    title: string,
    completed: boolean
}