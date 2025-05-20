import Concern from "../models/ConcernModel.js";

//CREATE
export const createConcern = async (req, res) => {
  const { concerns } = req.body;
  try {
    await Concern.create({ concerns });
    res.status(201).json({ msg: "Tecnical Issue Created Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

//READ
export const getConcerns = async (req, res) => {
  try {
    const concerns = await Concern.findAll();
    res.json(concerns);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//UPDATE
export const updateConcern = async (req, res) => {
  const { concerns } = req.body;
  try {
    const concern = await Concern.findByPk(req.params.id); // Find the concern by primary key
    if (!concern) {
      return res.status(404).json({ msg: "Concern not found" });
    }
    await Concern.update({ concerns }, { where: { id: req.params.id } });
    res.status(200).json({ msg: "Technical Issue Updated Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

//DELETE
export const deleteConcern = async (req, res) => {
  try {
    const concern = await Concern.findByPk(req.params.id); // Find the concern by primary key
    if (!concern) {
      return res.status(404).json({ msg: "Concern not found" });
    }
    await Concern.destroy({ where: { id: req.params.id } });
    res.status(200).json({ msg: "Technical Issue Deleted Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
