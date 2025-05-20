import Workgroup from "../models/WorkgroupModel.js"

export const createGroup = async (req, res) => {
     const { workgroups } = req.body;
     try {
        await Workgroup.create({ workgroups });
        res.status(201).json({ msg: "Group Created Successfully"})
     } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Internal Server Error"})
     }
}

export const getGroup = async (req, res) => {
    try {
        const workgroups = await Workgroup.findAll();
        res.json(workgroups);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const updateGroup = async (req, res) => {
    const { workgroups } = req.body;
    try {
        const workgroup = await Workgroup.findByPk(req.params.id);
        if (!workgroup) {
            return res.status(404).json({ msg: "Workgroup not Found"});
        }
        await Workgroup.update({ workgroups }, { where: { id: req.params.id }});
        res.status(200).json({ msg: "Workgroup Updated Successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg:"Internal Server Error"});
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const workgroup = await Workgroup.findByPk(req.params.id);
        if(!workgroup) {
            return res.status(404).json({ msg: "Group not found"});
        }
        await Workgroup.destroy({ where: { id: req.params.id }});
        res.status(200).json ({ msg: "WorkGroup Deleted Successfully" });
    } catch (error) {
        console.error(error.message);
        req.status(500).json({ msg:"Internal Server Error"});
    }
}