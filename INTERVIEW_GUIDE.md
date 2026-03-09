# Interview Guide: Arabic Sentiment Analyzer

This guide outlines the key speaking points and technical details to highlight during an interview when presenting the Arabic Sentiment Analyzer project.

## 1. The "Elevator Pitch" (The Problem & Solution)
*   **The Problem:** Analyzing customer feedback, social media, or reviews in Arabic is challenging due to the language's complexity and the sheer volume of data businesses receive.
*   **The Solution:** I built a React-based web application that leverages the Google Gemini API to automatically process and analyze the sentiment of Arabic text datasets. It turns raw data into actionable visual insights.
*   **Key Value Proposition:** It's a complete, end-to-end tool. A user can upload a spreadsheet, configure the analysis to respect API limits, watch the AI process the data in real-time, and immediately interact with a dashboard of the results.

## 2. Core Functionality & User Flow

Walk the interviewer through the user journey, highlighting the technical decisions made at each step:

### Step 1: Data Ingestion (`FileUpload.tsx`)
*   **What it does:** Allows users to upload `.csv`, `.xlsx`, `.xls`, or `.json` files via drag-and-drop or a standard file picker.
*   **Technical Highlight:** I implemented robust client-side parsing using `PapaParse` for CSVs and `XLSX` for Excel files. This means the data is processed entirely in the browser before any API calls are made, ensuring data privacy and reducing server load.

### Step 2: Intelligent Configuration (`DataPreview.tsx`)
*   **What it does:** Shows a preview of the uploaded data and lets the user map columns (e.g., which column holds the text, which holds the "verified" status).
*   **Technical Highlight (The `detectColumn` function):** I wrote a utility function that automatically scans the column headers and attempts to auto-select the correct columns based on common keywords (like 'comment', 'text', 'verified'). This significantly reduces friction for the user.
*   **Rate Limit Management:** I included controls for `batchSize` and `delayMs`. This is crucial when working with external APIs like Gemini to prevent hitting rate limits during large dataset processing.

### Step 3: Real-Time Processing (`AnalysisProgress.tsx` & `geminiService.ts`)
*   **What it does:** Sends the data to the Gemini API in batches and displays a live progress bar and the current comment being analyzed.
*   **Technical Highlight (The API Integration):** I used the `@google/genai` SDK. The `analyzeArabicSentimentBatch` function constructs a specific prompt asking the model to return structured JSON (positive, negative, neutral, and a numerical score).
*   **UX Consideration:** By showing the live analysis (with color-coded emojis for sentiment), the user isn't left staring at a static loading spinner. It builds trust in the tool.

### Step 4: The Dashboard (`FinalResults.tsx`)
*   **What it does:** Presents the final analysis through key metrics, charts, and a filterable data table.
*   **Technical Highlight (Data Visualization):** I used `Recharts` to build responsive pie, bar, and line charts. I specifically calculated derived metrics like "Net Sentiment Score" to give a quick health check of the data.
*   **Technical Highlight (Performance):** The data table uses React's `useMemo` hook for filtering. This ensures that filtering by "Verified Status" or "Sentiment" is instantaneous, even with large datasets, because it prevents unnecessary re-renders.

### Step 5: Advanced Features (Comparison & Saving)
*   **Brand Comparison (`ComparisonDashboard.tsx`):** Users can export an analysis to JSON and later upload it to compare against a new dataset. This is highly valuable for A/B testing campaigns or comparing competitors.
*   **Local Saving (`SavedProjectsList.tsx`):** I implemented a feature to save the entire analysis state to the browser's `localStorage`. This allows users to close the tab and return to their dashboard later without having to re-run the expensive AI analysis.

## 3. Technical Architecture & Design Decisions

*   **Framework:** React 18 with Vite. Chosen for its speed, modern hook-based architecture, and excellent developer experience.
*   **Language:** TypeScript. Crucial for a data-heavy application to define strict interfaces (like `AnalysisStats` and `CommentData`), preventing runtime errors when passing data between components.
*   **Styling:** Tailwind CSS. Allowed for rapid UI development. I specifically implemented a robust Dark/Light mode toggle that dynamically updates chart tooltips and table row colors for accessibility.
*   **State Management:** I kept state management relatively simple, lifting state up to `App.tsx` to act as the single source of truth, passing data down as props.

## 4. Potential Interview Questions & Answers

*   **Q: How do you handle API rate limits?**
    *   *A:* I implemented batching and artificial delays. The user can configure how many comments are sent per request and the pause between requests in the `DataPreview` component.
*   **Q: Why do parsing on the client side?**
    *   *A:* It avoids the need for a complex backend infrastructure just to handle file uploads. It's faster for the user, saves server costs, and is better for data privacy since the raw files never leave the user's machine until the specific text is sent to the AI.
*   **Q: How did you ensure the AI returns usable data?**
    *   *A:* Prompt engineering. In `geminiService.ts`, I explicitly instruct the model to return a specific JSON schema. I then parse that JSON response to ensure it fits the TypeScript interfaces expected by the frontend components.
