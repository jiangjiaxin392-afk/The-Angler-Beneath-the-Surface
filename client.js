const castButton = document.querySelector("#castButton");
const questionInput = document.querySelector("#questionInput");
const responseText = document.querySelector("#responseText");

castButton.addEventListener("click", () => {
  const question = questionInput.value.trim();

  responseText.textContent = question
    ? "Casting into the system..."
    : "Enter a question before casting.";

  if (!question) return;

  startCast();

  setTimeout(() => {
    responseText.textContent = "Prototype response: a visual catch appears. AI connection will be added later.";
  }, 1200);
});
