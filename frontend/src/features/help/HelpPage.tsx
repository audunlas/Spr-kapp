export function HelpPage() {
  return (
    <div className="help-page">
      <h1 className="help-title">How to use Språkapp</h1>

      <nav className="help-nav">
        <a href="#reading">Reading & Translation</a>
        <a href="#vocab">Vocabulary Lists</a>
        <a href="#practice">Flashcard Practice</a>
        <a href="#classes">Class Pages</a>
        <a href="#exercises">Grammar Exercises</a>
      </nav>

      <section id="reading" className="help-section">
        <h2>Reading & Translation</h2>
        <p>
          Upload a PDF or paste text directly from the main page. The app stores the
          text and lets you read it one page at a time, with a translation panel on the
          right (desktop) or sliding up from the bottom (mobile).
        </p>

        <h3>Translating a single word</h3>
        <p>Click or tap any word. The translation appears in the panel. Click ✕ to close.</p>

        <h3>Translating a phrase</h3>
        <p>
          Tap the first word — it becomes highlighted (the anchor). Then tap the last
          word of the phrase. The panel shows the translation of everything between the
          two taps. On desktop you can also click and drag across words to select a phrase.
        </p>

        <h3>Saving a word to a vocab list</h3>
        <p>
          Once a translation is showing, a dropdown appears at the bottom of the panel.
          Pick an existing list and click <strong>Add</strong>, or choose{" "}
          <strong>+ New vocab list</strong> from the dropdown to create one immediately.
        </p>
      </section>

      <section id="vocab" className="help-section">
        <h2>Vocabulary Lists</h2>
        <p>
          Go to <strong>Vocab</strong> in the navigation bar. Vocab lists are per
          language — a Spanish list only contains Spanish words.
        </p>

        <h3>Creating a list</h3>
        <p>Click <strong>+ New list</strong>, give it a name, and choose the language.</p>

        <h3>Adding words manually</h3>
        <p>
          Open a list and use the <strong>Add words</strong> input. Format:{" "}
          <code>native:target</code> — one pair per line. Example:
        </p>
        <pre className="help-code">{`hello:hola\ngoodbye:adiós`}</pre>

        <h3>Adding words from the reader</h3>
        <p>
          While reading, tap a word, wait for the translation, then pick a list from the
          dropdown and click <strong>Add</strong>. The word and its translation are saved
          automatically.
        </p>

        <h3>Editing and deleting</h3>
        <p>
          Click the trash icon next to any entry to remove it. Use the <strong>Rename</strong>{" "}
          button to rename the list, or <strong>Delete list</strong> to remove it entirely.
        </p>
      </section>

      <section id="practice" className="help-section">
        <h2>Flashcard Practice</h2>
        <p>
          Open a vocab list and click <strong>Practice</strong>. Choose a direction:
        </p>
        <table className="help-table">
          <thead>
            <tr><th>Direction</th><th>Shown</th><th>You type</th></tr>
          </thead>
          <tbody>
            <tr><td>Target → Native</td><td>Foreign word</td><td>Your native language</td></tr>
            <tr><td>Native → Target</td><td>Your native language</td><td>Foreign word</td></tr>
            <tr><td>Mixed</td><td>Random</td><td>Either</td></tr>
          </tbody>
        </table>
        <p>
          Type your answer and press <strong>Submit</strong>. The app tells you if you
          were right and shows the correct answer if you were wrong. At the end you see
          how many you got correct.
        </p>
        <p>
          For languages like Spanish, French, or German, character buttons (á, é, ñ, ü…)
          appear below the input so you don't need a foreign keyboard.
        </p>
      </section>

      <section id="classes" className="help-section">
        <h2>Class Pages</h2>
        <p>
          Class pages let you share a curated set of texts, vocab lists, and grammar
          exercises with a shareable link — no teacher or student accounts are required
          to view a class.
        </p>

        <h3>Creating a class</h3>
        <p>
          Go to <strong>Classes</strong> in the navigation bar. Click{" "}
          <strong>+ New class</strong>, enter a name and an optional description.
        </p>

        <h3>Managing content</h3>
        <p>Click <strong>Manage</strong> on a class. From here you can:</p>
        <ul>
          <li>Add texts from your document library</li>
          <li>Add vocab lists from your library</li>
          <li>Create and manage grammar exercises</li>
          <li>Copy the shareable link</li>
        </ul>

        <h3>Sharing</h3>
        <p>
          Click <strong>Copy link</strong> to get a URL like{" "}
          <code>yourapp.com/class/abc123</code>. Anyone with this link can read the
          texts, view the vocab tables, and do grammar exercises. Translation in the
          reader requires an account; everything else does not.
        </p>
      </section>

      <section id="exercises" className="help-section">
        <h2>Grammar Exercises</h2>
        <p>
          Grammar exercises let you mark specific words in a text as correct answers.
          Students read the same text, click what they think matches, and get immediate
          feedback. The exercise can be about anything — verb tenses, adjectives, nouns,
          false friends — you write the instruction.
        </p>

        <h3>Creating an exercise</h3>
        <ol>
          <li>Open a class → <strong>Manage</strong> → click <strong>+ New exercise</strong></li>
          <li>
            Fill in a <strong>title</strong>, an <strong>instruction</strong> for students
            (e.g. "Mark all verbs in the indefinido tense"), and the <strong>text</strong>
          </li>
          <li>Click <strong>Continue: Mark words →</strong></li>
          <li>
            The text appears with all words clickable. Click each correct word to mark it
            (highlighted in gold). Click again to unmark.
          </li>
          <li>Click <strong>Save exercise</strong></li>
        </ol>
        <p>
          To change the text after marking, click <strong>Edit text</strong> — this clears
          all marks since word positions would shift.
        </p>

        <h3>Doing an exercise (student view)</h3>
        <ol>
          <li>Open the class link and click an exercise</li>
          <li>Read the instruction banner</li>
          <li>Click the words you think match (blue highlight). Click again to deselect.</li>
          <li>Click <strong>Submit</strong></li>
        </ol>
        <p>After submitting the text is coloured:</p>
        <table className="help-table">
          <thead>
            <tr><th>Colour</th><th>Meaning</th></tr>
          </thead>
          <tbody>
            <tr><td>Green</td><td>You selected it and it was correct</td></tr>
            <tr><td>Red</td><td>You selected it but it was wrong</td></tr>
            <tr><td>Amber (dashed)</td><td>Correct answer you missed</td></tr>
          </tbody>
        </table>
        <p>
          Your score is shown as <em>X / Y correct</em>. Click <strong>Try again</strong>{" "}
          to reset and have another go.
        </p>
      </section>
    </div>
  );
}
