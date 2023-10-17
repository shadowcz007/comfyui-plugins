// Provide menu item as plain object
const newItem = { text: "Item from object" }

// Register all the above functions and objects with the relevant extension points
export function init({ register }) {
  register('extend-menu', 'newItem', newItem)
}