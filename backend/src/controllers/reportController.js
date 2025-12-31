import RentalEntry from "../models/RentalEntry.js";
import mongoose from "mongoose";

// @desc    Get rental reports
// @route   GET /reports/rent
// @access  Private/Admin
export const getRentalReports = async (req, res) => {
  try {
    const { carId, month, startDate, endDate } = req.query;

    const matchStage = {};

    // Filter by Car ID
    if (carId) {
      matchStage.car = new mongoose.Types.ObjectId(carId);
    }

    // Filter by Date Range (startDate to endDate)
    // IMPORTANT: Users want to see reports based on when money is COLLECTED (End Time), not Start Time.
    // Also, Active rentals (no End Time) should not be counted in revenue yet.
    if (startDate && endDate) {
      matchStage.endTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Filter by Month (e.g., month=2023-12)
    if (month) {
      const date = new Date(month);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      matchStage.endTime = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    // Ensure we only look at COMPLETED rentals or at least those with an End Time
    // because "Active" rentals haven't collected money yet (technically).
    // The matchStage.endTime range checks implicitly filter out nulls, but if no date filter is applied,
    // we should still exclude active ones if we want "Revenue".
    // However, if the user just hits "Rentals", maybe they want to see all?
    // But this is "Reports". Usually revenue reports implies finalized money.
    // Let's enforce endTime exists.
    if (!matchStage.endTime) {
      matchStage.endTime = { $ne: null };
    }

    // If both month and dateRange provided, dateRange takes precedence or combine intersection?
    // Usually assume one or the other. Code above overrides if month comes after dateRange.
    // I should check if matchStage.startTime is already set.
    // But for simplicity, let's assume valid usage.

    const pipeline = [
      { $match: matchStage },
      {
        $facet: {
          rentals: [
            {
              $lookup: {
                from: "cars",
                localField: "car",
                foreignField: "_id",
                as: "car",
              },
            },
            { $unwind: "$car" },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: "$user" },
            {
              $project: {
                "user.googleId": 0,
                "user.role": 0,
                "user.createdAt": 0,
                "user.updatedAt": 0,
                "car.createdAt": 0,
                "car.updatedAt": 0,
              },
            },
            { $sort: { startTime: -1 } },
          ],
          totalAllTime: [
            {
              $group: {
                _id: null,
                totalCollected: { $sum: "$finalAmountCollected" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const results = await RentalEntry.aggregate(pipeline);

    const data = results[0];
    const totalCollected = data.totalAllTime[0]
      ? data.totalAllTime[0].totalCollected
      : 0;
    const count = data.totalAllTime[0] ? data.totalAllTime[0].count : 0;

    res.json({
      meta: {
        totalCollected,
        count,
        filters: { carId, month, startDate, endDate },
      },
      rentals: data.rentals,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get aggregated stats (Monthly and Per Car)
// @route   GET /reports/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const pipelineCar = [
      {
        $group: {
          _id: "$car",
          totalCollected: { $sum: "$finalAmountCollected" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "_id",
          as: "carDetails",
        },
      },
      { $unwind: "$carDetails" },
      {
        $project: {
          carBrand: "$carDetails.brand",
          carModel: "$carDetails.model",
          plateNumber: "$carDetails.plateNumber",
          totalCollected: 1,
          count: 1,
        },
      },
    ];

    const pipelineMonth = [
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$startTime" } },
          totalCollected: { $sum: "$finalAmountCollected" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ];

    const [carStats, monthStats] = await Promise.all([
      RentalEntry.aggregate(pipelineCar),
      RentalEntry.aggregate(pipelineMonth),
    ]);

    res.json({
      perCar: carStats,
      monthly: monthStats,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
