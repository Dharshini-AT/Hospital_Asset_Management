const generateSequenceId = async (model, idField, prefix, digits = 4) => {
  try {
    const regex = new RegExp(`^${prefix}-\\d+$`);
    const allDocs = await model.find({ [idField]: regex })
      .select(idField)
      .lean();

    let maxNum = 0;
    for (const doc of allDocs) {
      if (doc[idField]) {
        const num = parseInt(doc[idField].replace(`${prefix}-`, ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNumber = maxNum + 1;
    return `${prefix}-${String(nextNumber).padStart(digits, '0')}`;
  } catch (error) {
    const fallback = Date.now().toString().slice(-6);
    return `${prefix}-${fallback}`;
  }
};

module.exports = {
  generateSequenceId,
};
