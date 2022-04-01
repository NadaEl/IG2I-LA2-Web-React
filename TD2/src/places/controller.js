class Places {
  constructor(data) {
    this.data = data;
  }
  configure(app) {
    const data = this.data;

    app.get("/api/places/:id", async (request, response) => {
      let id = request.params.id;
      const place = await data.getPlaceAsync(id);
      if (place !== undefined) {
        response.status(200).json(place);
        return;
      }
      response.status(404).json({key: "entity.not.found"});
    });
    
    app.get("/api/places/", async (request, response) => {
      const place = await data.getPlacesAsync();
      response.setHeader("Access-Control-Allow-Origin",`http://localhost:3000`);
      if (place !== undefined) {
        response.status(200).json(place);
        return;
      }
      if (place == undefined){
        response.status(404).json({key: "entity.not.found"});
      }
      
    });

    app.options("/api/places/", async (request, response) => {
      response.setHeader("Access-Control-Allow-Origin",`http://localhost:3000`);
      response.setHeader("Access-Control-Allow-Methods",`GET,OPTIONS`);
      response.setHeader("Access-Control-Allow-Headers",`Content-Type,my-header-custom`);
    });

    app.post("/api/places/", async (request, response) => {
      let newPlace = request.body;
      var Validator = require('jsonschema').Validator;
      const regexurl="(https|http):?:\/\/.*";
      var validator = new Validator();
      var schema = {
        "id": "/Place",
        "type": "object",
        "properties": {
          "image": {
            "type": "object",
            "properties": {
              "url": {"type": "string",  "pattern": regexurl},
              "title": {"type": "string", "minLength": 3, "maxLength": 100}
            },
            "required": ["url", "title"]
          },
          "name": {"type": "string", "minLength": 3, "maxLength": 100, pattern:'^[a-zA-Z -]*$'},
          "author": {"type": "string", "minLength": 3, "maxLength": 100, pattern:'^[a-zA-Z -]*$'},
          "review": {"type": "int","minimum": 1, "maximum": 9}
        },
        "required": ["author", "review", "name"]
      };
      validator.addSchema(schema, '/Place')
      var validationResult = validator.validate(newPlace, schema)
      if(validationResult.errors.length > 0 ){
        response.status(400).json();
        return validationResult;
      }

      const id = await data.savePlaceAsync(newPlace);
      response.setHeader("Location",`http://localhost:8081/places/{id}`);
      response.status(201).json();
    });


    app.delete("/api/places/:id", async (request, response) => {
      const id = request.params.id;

      const supp = await data.deletePlaceAsync(id);
      if (supp == false){
        response.status(400).json({supprime:supp});
      }
      if (supp == true){
        response.status(200).json({supprime:supp});
      }
    });
  }
}
module.exports = Places;
