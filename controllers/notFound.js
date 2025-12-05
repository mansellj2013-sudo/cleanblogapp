// Controller to handle 404 errors
export default (req, res) => {
  res.render("404", { req });
};
