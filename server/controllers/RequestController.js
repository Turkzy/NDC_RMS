import Request from "../models/RequestModel.js";

// CREATE
export const createRequest = async (req, res) => {
  const { workgroup, requestedby, issue} = req.body;
  try {
    await Request.create({ workgroup, requestedby, issue});
    res.status(201).json({ msg: "Request Created Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// READ
export const getRequests = async (req, res) => {
  try {
    const requests = await Request.findAll();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// UPDATE
export const updateRequest = async (req, res) => {
  const { workgroup, requestedby, issue } = req.body;
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }
    await Request.update({ workgroup, requestedby, issue }, { where: { id: req.params.id } });
    res.status(200).json({ msg: "Request Updated Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// DELETE
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }
    await Request.destroy({ where: { id: req.params.id } });
    res.status(200).json({ msg: "Request Deleted Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
