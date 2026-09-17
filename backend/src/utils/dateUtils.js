const calculateWarrantyStatus = (warrantyEndDate) => {
  if (!warrantyEndDate) return 'UNKNOWN';

  const today = new Date();
  const end = new Date(warrantyEndDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  } else if (diffDays <= 30) {
    return 'EXPIRING_SOON';
  } else {
    return 'ACTIVE';
  }
};

const getDaysUntilWarrantyExpires = (warrantyEndDate) => {
  if (!warrantyEndDate) return null;
  const today = new Date();
  const end = new Date(warrantyEndDate);
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateNextMaintenanceDate = (baseDate, frequency) => {
  const date = new Date(baseDate || new Date());
  const freq = (frequency || '').toUpperCase();

  switch (freq) {
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'BI-MONTHLY':
      date.setMonth(date.getMonth() + 2);
      break;
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'SEMI-ANNUAL':
    case 'SEMI-ANNUALLY':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'ANNUAL':
    case 'ANNUALLY':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      // If frequency is a number in days
      const days = parseInt(freq, 10);
      if (!isNaN(days) && days > 0) {
        date.setDate(date.getDate() + days);
      } else {
        date.setMonth(date.getMonth() + 3); // default quarterly
      }
      break;
  }

  return date;
};

const calculateDowntimeHours = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;
  return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));
};

module.exports = {
  calculateWarrantyStatus,
  getDaysUntilWarrantyExpires,
  calculateNextMaintenanceDate,
  calculateDowntimeHours,
};
