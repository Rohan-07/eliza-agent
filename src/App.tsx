import { useState } from "react";
import { characterSchema, formatZodError } from "./lib/schema"; // Assuming schema.js contains your Zod schema

function App() {
	const [file, setFile] = useState(null);
	const [character, setCharacter] = useState(null);
	const [errors, setErrors] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		setFile(selectedFile);
		setErrors(null);
		setCharacter(null);
	};

	const validateFile = async () => {
		if (!file) return;

		setIsLoading(true);
		setErrors(null);

		try {
			const text = await file.text();
			const json = JSON.parse(text);

			try {
				// Validate against schema
				const validatedData = characterSchema.parse(json);
				setCharacter(validatedData);
				setErrors(null);
			} catch (validationError) {
				setCharacter(null);
				setErrors(formatZodError(validationError));
			}
		} catch (error) {
			setCharacter(null);
			setErrors([
				{ path: "file", message: "Invalid JSON format", code: "custom" },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-3xl font-bold mb-6">Character JSON Validator</h1>

			<div className="mb-6 p-4 bg-gray-100 rounded-lg">
				<div className="flex items-center gap-4">
					<input
						type="file"
						accept=".json"
						onChange={handleFileChange}
						className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
					/>
					<button
						onClick={validateFile}
						disabled={!file || isLoading}
						className={`px-4 py-2 rounded-lg font-medium ${
							!file || isLoading
								? "bg-gray-300 text-gray-500 cursor-not-allowed"
								: "bg-blue-600 text-white hover:bg-blue-700"
						}`}
					>
						{isLoading ? "Validating..." : "Validate JSON"}
					</button>
				</div>

				{file && (
					<p className="mt-2 text-sm text-gray-600">
						Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
					</p>
				)}
			</div>

			{errors && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<h2 className="text-xl font-semibold text-red-700 mb-2">
						Validation Errors
					</h2>
					<ul className="space-y-1">
						{errors.map((error, index) => (
							<li key={index} className="text-red-600">
								<span className="font-medium">{error.path || "General"}:</span>{" "}
								{error.message}
							</li>
						))}
					</ul>
				</div>
			)}

			{character && (
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
					<h2 className="text-xl font-semibold text-green-700 mb-4">
						Valid Character Data
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-medium">Basic Info</h3>
								<p>
									<span className="font-medium">Name:</span> {character.name}
								</p>
								<p>
									<span className="font-medium">Model Provider:</span>{" "}
									{character.modelProvider}
								</p>
							</div>

							<div>
								<h3 className="text-lg font-medium">Clients</h3>
								<ul className="list-disc list-inside">
									{character.clients.map((client, idx) => (
										<li key={idx}>{client}</li>
									))}
								</ul>
							</div>

							{character.plugins && character.plugins.length > 0 && (
								<div>
									<h3 className="text-lg font-medium">Plugins</h3>
									<ul className="list-disc list-inside">
										{character.plugins.map((plugin, idx) => (
											<li key={idx}>{plugin}</li>
										))}
									</ul>
								</div>
							)}
						</div>

						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-medium">Adjectives</h3>
								<div className="flex flex-wrap gap-2">
									{character.adjectives.map((adj, idx) => (
										<span
											key={idx}
											className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
										>
											{adj}
										</span>
									))}
								</div>
							</div>

							<div>
								<h3 className="text-lg font-medium">Topics</h3>
								<div className="flex flex-wrap gap-2">
									{character.topics.map((topic, idx) => (
										<span
											key={idx}
											className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
										>
											{topic}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="mt-6">
						<h3 className="text-lg font-medium">Bio</h3>
						<ul className="list-disc list-inside mt-2">
							{character.bio.map((item, idx) => (
								<li key={idx} className="mb-2">
									{item}
								</li>
							))}
						</ul>
					</div>

					<div className="mt-6">
						<h3 className="text-lg font-medium">System</h3>
						<p className="mt-2 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
							{character.system}
						</p>
					</div>

					<details className="mt-6">
						<summary className="cursor-pointer text-lg font-medium py-2">
							Show Full JSON Data
						</summary>
						<pre className="mt-2 bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-96">
							{JSON.stringify(character, null, 2)}
						</pre>
					</details>
				</div>
			)}
		</div>
	);
}

export default App;
