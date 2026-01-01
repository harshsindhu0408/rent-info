import RentalEntry from "../models/RentalEntry.js";
import mongoose from "mongoose";

// @desc    Get rental reports
// @route   GET /reports/rent
// @access  Private
export const getRentalReports = async (req, res) => {
  try {
    const { carId, month, startDate, endDate, includeActive } = req.query;

    const matchStage = {
      user: req.user._id, // Filter by user
    };

    // Filter by Car ID
    if (carId) {
      matchStage.car = new mongoose.Types.ObjectId(carId);
    }

    // Filter by Date Range
    if (startDate && endDate) {
      if (includeActive === "true") {
        matchStage.startTime = {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        };
      } else {
        matchStage.endTime = {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        };
      }
    }

    // Filter by Month
    if (month && !startDate && !endDate) {
      const date = new Date(month);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      if (includeActive === "true") {
        matchStage.startTime = { $gte: startOfMonth, $lte: endOfMonth };
      } else {
        matchStage.endTime = { $gte: startOfMonth, $lte: endOfMonth };
      }
    }

    // If no date filter and not including active, require endTime
    if (
      !matchStage.endTime &&
      !matchStage.startTime &&
      includeActive !== "true"
    ) {
      matchStage.endTime = { $ne: null };
    }

    // Optimized pipeline - uses indexes on car, status, endTime, startTime
    const pipeline = [
      { $match: matchStage },
      {
        $facet: {
          rentals: [
            { $sort: { startTime: -1 } }, // Uses startTime index
            { $limit: 100 }, // Limit for performance
            {
              $lookup: {
                from: "cars",
                localField: "car",
                foreignField: "_id",
                as: "car",
                pipeline: [
                  { $project: { brand: 1, model: 1, plateNumber: 1 } },
                ],
              },
            },
            { $unwind: "$car" },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [{ $project: { name: 1, email: 1 } }],
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                car: 1,
                user: 1,
                customer: 1,
                startTime: 1,
                endTime: 1,
                status: 1,
                isSettled: 1,
                finalAmountCollected: 1,
                advance: 1,
              },
            },
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalCollected: { $sum: "$finalAmountCollected" },
                count: { $sum: 1 },
                activeCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
                },
                completedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ];

    const results = await RentalEntry.aggregate(pipeline);
    const data = results[0];
    const totals = data.totals[0] || {
      totalCollected: 0,
      count: 0,
      activeCount: 0,
      completedCount: 0,
    };

    res.json({
      meta: {
        totalCollected: totals.totalCollected,
        count: totals.count,
        activeCount: totals.activeCount,
        completedCount: totals.completedCount,
        filters: { carId, month, startDate, endDate, includeActive },
      },
      rentals: data.rentals,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get aggregated stats (optimized with proper indexing)
// @route   GET /reports/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const userIdMatch = { $match: { user: req.user._id } };

    // Run all aggregations in parallel for speed
    const [carStats, monthStats, overallStats] = await Promise.all([
      // Per Car stats - uses car index
      RentalEntry.aggregate([
        userIdMatch,
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
            pipeline: [{ $project: { brand: 1, model: 1, plateNumber: 1 } }],
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
        { $sort: { totalCollected: -1 } },
        { $limit: 10 }, // Top 10 cars only
      ]),

      // Monthly stats - uses startTime index
      RentalEntry.aggregate([
        userIdMatch,
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$startTime" } },
            totalCollected: { $sum: "$finalAmountCollected" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 12 }, // Last 12 months only
      ]),

      // Overall stats - single pass
      RentalEntry.aggregate([
        userIdMatch,
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$finalAmountCollected" },
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
            },
            completedCount: {
              $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
            },
            pendingSettlement: {
              $sum: { $cond: [{ $eq: ["$isSettled", false] }, 1, 0] },
            },
            totalDeductions: { $sum: "$deductions.amount" },
            totalChot: { $sum: "$chot" },
            totalGhata: { $sum: "$ghata.amount" },
          },
        },
      ]),
    ]);

    res.json({
      perCar: carStats,
      monthly: monthStats,
      overall: overallStats[0] || {
        totalCollected: 0,
        count: 0,
        activeCount: 0,
        completedCount: 0,
        pendingSettlement: 0,
        totalDeductions: 0,
        totalChot: 0,
        totalGhata: 0,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
