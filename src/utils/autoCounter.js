const { default: mongoose } = require('mongoose');
const autoCounterSchema = require('../model/autoCounterModel');

exports.createAutoId = async (userId) => {
  let getData;
  if (userId) {
    getData = await autoCounterSchema.findOne({
      userId: mongoose.Types.ObjectId(userId),
    });
  }
  if (getData === null) {
    const addNewData = await new autoCounterSchema({
      userId: userId,
      autoId: 1,
    });
    addNewData.save();
    return '0001';
  } else {
    let newAutoId = parseInt(getData?.autoId) + parseInt(1);
    await autoCounterSchema.findOneAndUpdate(
      { userId: mongoose.Types.ObjectId(userId) },
      {
        $set: {
          autoId: newAutoId,
        },
      },
      { new: true }
    );
    return newAutoId.toString().padStart(4, '0');
  }
};

