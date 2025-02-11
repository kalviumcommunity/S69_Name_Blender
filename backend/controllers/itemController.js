// controllers/itemController.js
const items = []; // Temporary in-memory storage

exports.createItem = (req, res) => {
  const { name, description } = req.body;
  const newItem = { id: items.length + 1, name, description };
  items.push(newItem);
  res.status(201).json({ message: "Item created", item: newItem });
};

exports.getItem = (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
};

exports.updateItem = (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });

  const { name, description } = req.body;
  item.name = name || item.name;
  item.description = description || item.description;

  res.json({ message: "Item updated", item });
};

exports.deleteItem = (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Item not found" });

  items.splice(index, 1);
  res.json({ message: "Item deleted" });
};
