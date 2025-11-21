export class Document {
  constructor (
    public id: string, 
    public name: string, 
    public description: string, 
    public url: string, 
    public children: Document[] = [], // if no children are provided when creating the Document, set children to an empty array automatically
    public _id?: string
   ) {}
}