const pdfParse = jest.fn().mockResolvedValue({
  text: "Mocked resume text with React TypeScript Node.js MongoDB skills",
});

module.exports = pdfParse;
