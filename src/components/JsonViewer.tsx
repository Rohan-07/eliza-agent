import { useState } from "react";

type JsonViewerProps = {
	data: any;
	initialExpanded?: boolean;
};

type JsonNodeProps = {
	name: string | null;
	value: any;
	initialExpanded?: boolean;
	isRoot?: boolean;
	path?: string;
};

const JsonNode = ({
	name,
	value,
	initialExpanded = false,
	isRoot = false,
	path = "",
}: JsonNodeProps) => {
	const [isExpanded, setIsExpanded] = useState(initialExpanded || isRoot);
	const type = Array.isArray(value) ? "array" : typeof value;
	const fullPath = name ? (path ? `${path}.${name}` : name) : path;

	// Format the display of different value types
	const getValueDisplay = () => {
		if (value === null) return <span className="text-gray-500">null</span>;
		if (value === undefined)
			return <span className="text-gray-500">undefined</span>;

		switch (type) {
			case "string":
				return <span className="text-green-600">"{value}"</span>;
			case "number":
				return <span className="text-blue-600">{value}</span>;
			case "boolean":
				return <span className="text-purple-600">{value.toString()}</span>;
			case "object":
			case "array":
				const count = Array.isArray(value)
					? value.length
					: Object.keys(value).length;
				return (
					<span className="text-gray-500">
						{Array.isArray(value) ? `Array(${count})` : `Object{${count}}`}
					</span>
				);
			default:
				return <span>{String(value)}</span>;
		}
	};

	// For primitive values (not objects or arrays)
	if (type !== "object" && type !== "array") {
		return (
			<div className="flex items-start py-1">
				{name !== null && (
					<span className="font-medium text-gray-800 mr-2">{name}:</span>
				)}
				{getValueDisplay()}
			</div>
		);
	}

	// For objects and arrays
	return (
		<div className="py-1">
			<div
				className="flex items-center cursor-pointer hover:bg-gray-100 rounded px-1"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<span className="mr-1 text-gray-500 w-4">{isExpanded ? "▼" : "►"}</span>

				{name !== null && (
					<span className="font-medium text-gray-800 mr-2">{name}:</span>
				)}

				{getValueDisplay()}
			</div>

			{isExpanded && (
				<div className="pl-6 border-l border-gray-200 ml-2 mt-1">
					{type === "array"
						? // Render array items
						  value.map((item: any, index: number) => (
								<JsonNode
									key={index}
									name={`${index}`}
									value={item}
									path={`${fullPath}[${index}]`}
								/>
						  ))
						: // Render object properties
						  Object.entries(value).map(([key, propValue]) => (
								<JsonNode
									key={key}
									name={key}
									value={propValue}
									path={fullPath ? `${fullPath}.${key}` : key}
								/>
						  ))}
				</div>
			)}
		</div>
	);
};

const JsonViewer = ({ data, initialExpanded = false }: JsonViewerProps) => {
	return (
		<div className="font-mono text-sm bg-white rounded-md p-4 overflow-auto max-h-[70vh]">
			<JsonNode
				name={null}
				value={data}
				initialExpanded={initialExpanded}
				isRoot={true}
			/>
		</div>
	);
};

export default JsonViewer;
