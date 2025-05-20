import Personnel from "../models/ItpersonnelModel.js"

//CREATE
export const createPersonnel = async (req, res) => {
    const { personnels } = req.body;
    try {
      await Personnel.create({ personnels });
      res.status(201).json({ msg: "IT Personnel Created Successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };
  
  //READ
  export const getPersonnel = async (req, res) => {
    try {
      const personnels = await Personnel.findAll();
      res.json(personnels);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
  
  //UPDATE
  export const updatePersonnel = async (req, res) => {
    const personnel = await Personnel.findOne({ where: {id: req.params.id}});
    if(!personnel) return res.status(404).json({msg: "Personnel Not Found"});

    const { personnels } = req.body;
    try {
      await Personnel.update({ personnels }, {where: {id: req.params.id}});
      res.status(200).json ({ msg: "Personnel Updated Successfully"});
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Internal Server Error"});
    }
  };
  
  //DELETE
  export const deletePersonnel = async (req, res) => {
    const personnel = await Personnel.findOne({ where: {id: req.params.id}});
    if(!personnel) return res.status(404).json({msg: "Personnel Not Found"});

    try {
      await Personnel.destroy({ where: { id: req.params.id}});
      res.status(200).json({ msg: "Personnel Deleted Successfully"});
    } catch (error) {
      console.error(error.message);
      res.status(500).json({msg: "Internal Server Error"})
    }
  }