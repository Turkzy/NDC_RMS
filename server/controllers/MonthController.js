// MonthController.js
import Month from "../models/MonthModel.js";

export const getMonthsByYearId = async (req, res) => {
  try {
    const { yearId } = req.params;
    const months = await Month.findAll({
      where: { yearId }
    });

    res.status(200).json(months);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching months", error });
  }
};