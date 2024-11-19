import { TareaModel } from "./tps.ts"

export const fromModelToTarea = ((model: TareaModel) => ({
    id: model._id!.toString(),
    title: model.title,
    completed: model.completed
}))