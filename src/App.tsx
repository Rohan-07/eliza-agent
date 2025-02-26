import { useState, useEffect } from "react";
import { validateCharacterConfig } from "./lib/schema";
import { z } from "zod";
import JsonViewer from "./components/JsonViewer";
import sampleJson from "./assets/agent.character.json";

interface ValidationError {
	path?: string;
	message: string;
	code?: string;
}

function App() {
	const [jsonData, setJsonData] = useState<any>(null);
	const [validatedData, setValidatedData] = useState<any>(null);
	const [errors, setErrors] = useState<ValidationError[] | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedFile, setSelectedFile] = useState<string>("sample.json");

	// Load and validate JSON data on component mount
	useEffect(() => {
		const loadJsonData = async () => {
			setIsLoading(true);
			setErrors(null);

			try {
				// We're using the imported JSON directly
				setJsonData(sampleJson);

				try {
					// Validate against the character schema
					const validated = validateCharacterConfig(sampleJson);
					setValidatedData(validated);
					setErrors(null);
				} catch (validationError) {
					if (validationError instanceof z.ZodError) {
						// Convert Zod errors to our format
						const groupedErrors = validationError.errors.reduce((acc, err) => {
							const path = err.path.join(".");
							if (!acc[path]) {
								acc[path] = [];
							}
							acc[path].push(err.message);
							return acc;
						}, {} as Record<string, string[]>);

						// Transform grouped errors to our ValidationError format
						const formattedErrors = Object.entries(groupedErrors).map(
							([path, messages]) => ({
								path,
								message: messages.join(" - "),
								code: "validation_error",
							})
						);

						setErrors(formattedErrors);
					} else {
						setErrors([
							{
								message: `Validation error: ${
									(validationError as Error).message
								}`,
							},
						]);
					}
					setValidatedData(null);
				}
			} catch (error) {
				setJsonData(null);
				setValidatedData(null);
				setErrors([
					{
						message: `Error loading JSON: ${(error as Error).message}`,
					},
				]);
			} finally {
				setIsLoading(false);
			}
		};

		loadJsonData();
	}, [selectedFile]);

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-3xl font-bold mb-6">Character JSON Validator</h1>

			<div className="mb-6 p-4 bg-gray-100 rounded-lg">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold">Character Configuration</h2>
						<p className="text-gray-600">
							{selectedFile} {isLoading ? "(Loading...)" : ""}
						</p>
					</div>
					{validatedData && !errors && (
						<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
							Valid Character Config
						</span>
					)}
				</div>
			</div>

			{errors && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<h2 className="text-xl font-semibold text-red-700 mb-2">
						Validation Errors
					</h2>
					<p className="text-gray-700 mb-3">
						The following issues were found in your character configuration:
					</p>
					<ul className="space-y-3">
						{errors.map((error, index) => {
							// Get a user-friendly field name
							const fieldName = error.path
								? error.path
										.split(".")
										.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
										.join(" → ")
								: "General";

							// Get a user-friendly error message
							let friendlyMessage = error.message;

							// Replace common Zod error messages with more user-friendly ones
							if (friendlyMessage.includes("Required")) {
								friendlyMessage = "This field is required and cannot be empty";
							} else if (friendlyMessage.includes("Expected")) {
								friendlyMessage = friendlyMessage.replace(
									"Expected",
									"Should be"
								);
							}

							// Add suggestions based on the error type
							let suggestion = "";
							if (error.code === "invalid_type") {
								suggestion = "Check the data type of this field";
							} else if (error.path?.includes("modelProvider")) {
								suggestion =
									"Make sure the model provider is one of the allowed values";
							} else if (error.path?.includes("plugins")) {
								suggestion = "Ensure plugins are properly formatted";
							}

							return (
								<li
									key={index}
									className="bg-white p-3 rounded shadow-sm border border-red-100"
								>
									<div className="font-medium text-red-700 mb-1">
										{fieldName}
									</div>
									<div className="text-red-600 mb-1">{friendlyMessage}</div>
									{suggestion && (
										<div className="text-gray-600 text-sm italic">
											Tip: {suggestion}
										</div>
									)}
								</li>
							);
						})}
					</ul>
					<div className="mt-4 text-sm text-gray-600 bg-gray-100 p-3 rounded">
						<p className="font-medium">Need help?</p>
						<p>
							Make sure your JSON follows the character schema format. Common
							issues include:
						</p>
						<ul className="list-disc list-inside mt-1">
							<li>Missing required fields (name, modelProvider, etc.)</li>
							<li>Incorrect data types (string vs array)</li>
							<li>Invalid model provider name</li>
							<li>Arrays that should have at least one item</li>
						</ul>
					</div>
				</div>
			)}

			{validatedData && (
				<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
					<h2 className="text-xl font-semibold mb-4">
						Character Configuration
					</h2>

					<div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-medium border-b pb-2">
									Basic Info
								</h3>
								<p className="mt-2">
									<span className="font-medium">Name:</span>{" "}
									{validatedData.name}
								</p>
								<p>
									<span className="font-medium">Model Provider:</span>{" "}
									{validatedData.modelProvider}
								</p>
								{validatedData.settings?.model && (
									<p>
										<span className="font-medium">Model:</span>{" "}
										{validatedData.settings.model}
									</p>
								)}
							</div>

							<div>
								<h3 className="text-lg font-medium border-b pb-2">Plugins</h3>
								{validatedData.plugins && validatedData.plugins.length > 0 ? (
									<ul className="list-disc list-inside mt-2">
										{Array.isArray(validatedData.plugins) &&
											validatedData.plugins.map((plugin: any, idx: number) => (
												<li key={idx} className="mt-1">
													{typeof plugin === "string" ? plugin : plugin.name}
												</li>
											))}
									</ul>
								) : (
									<p className="text-gray-500 mt-2">No plugins configured</p>
								)}
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-medium border-b pb-2">Traits</h3>
								<div className="flex flex-wrap gap-2 mt-2">
									{validatedData.adjectives &&
										validatedData.adjectives.map((adj: string, idx: number) => (
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
								<h3 className="text-lg font-medium border-b pb-2">Topics</h3>
								<div className="flex flex-wrap gap-2 mt-2">
									{validatedData.topics &&
										validatedData.topics.map((topic: string, idx: number) => (
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
						<h3 className="text-lg font-medium border-b pb-2">Bio</h3>
						<div className="mt-2">
							{Array.isArray(validatedData.bio) ? (
								<ul className="list-disc list-inside">
									{validatedData.bio.map((item: string, idx: number) => (
										<li key={idx} className="mt-1">
											{item}
										</li>
									))}
								</ul>
							) : (
								<p>{validatedData.bio}</p>
							)}
						</div>
					</div>

					<details className="mt-6">
						<summary className="cursor-pointer text-lg font-medium py-2 border-b">
							Show Full JSON Data
						</summary>
						<div className="mt-4">
							<JsonViewer data={validatedData} initialExpanded={false} />
						</div>
					</details>
				</div>
			)}
		</div>
	);
}

export default App;
