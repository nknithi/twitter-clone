// Function to format a date string into a more readable format
const formatDate = (dateString) => {

  // Convert the date string into a Date object
  const date = new Date(dateString);


  // Define the options for formatting the date
  const options = {
    weekday: 'short',  // Abbreviated weekday name (e.g., Mon, Tue)
    month: 'short', // Abbreviated month name (e.g., Jan, Feb)
    day: '2-digit', // 2-digit day of the month (e.g., 01, 02)
    year: 'numeric'   // Full numeric year (e.g., 2024)
  };


  // Format the date using toLocaleDateString with the specified options
  const formattedDate = date.toLocaleDateString('en-US', options)
    .replace(/,/g, ''); // Remove commas globally

  // Return the formatted date string
  return formattedDate;
};

// Export the formatDate function as the default export
export default formatDate;
