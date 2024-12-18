import { XMLParser } from "fast-xml-parser";
import { Difficulty, Operation, Problem } from "./types.ts";

interface OWLProblem {
  "ex:problemStatement": string;
  "ex:correctAnswer": { "@_rdf:datatype": string; "#text": string };
  "ex:requiresOperation": { "@_rdf:resource": string };
  "ex:hasDifficulty": { "@_rdf:resource": string };
  "ex:timeLimit": { "@_rdf:datatype": string; "#text": string };
}

export function parseOWLFile(owlContent: string): Problem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
  });

  const result = parser.parse(owlContent);
  const descriptions = result["rdf:RDF"]["rdf:Description"];

  if (!Array.isArray(descriptions)) {
    console.error("Expected an array of descriptions, but got:", typeof descriptions);
    return [];
  }

  const problems: Problem[] = [];

  descriptions.forEach((desc: any) => {
    if (
      desc["rdf:type"] &&
      desc["rdf:type"]["@_rdf:resource"] &&
      (desc["rdf:type"]["@_rdf:resource"].endsWith("#Problem") ||
        desc["rdf:type"]["@_rdf:resource"].endsWith("#Example"))
    ) {
      const problem = desc as OWLProblem;

      if (
        !problem["ex:problemStatement"] ||
        !problem["ex:correctAnswer"] ||
        !problem["ex:requiresOperation"] ||
        !problem["ex:hasDifficulty"] ||
        !problem["ex:timeLimit"]
      ) {
        console.warn("Skipping incomplete problem:", desc["@_rdf:about"]);
        return;
      }

      const operationResource = problem["ex:requiresOperation"]["@_rdf:resource"];
      const operation = operationResource.split("#")[1] as Operation;

      const difficultyResource = problem["ex:hasDifficulty"]["@_rdf:resource"];
      const difficulty = difficultyResource.split("#")[1] as Difficulty;

      problems.push({
        id: desc["@_rdf:about"].split("#")[1],
        problemStatement: problem["ex:problemStatement"],
        correctAnswer: parseFloat(problem["ex:correctAnswer"]["#text"]),
        operation,
        difficulty,
        timeLimit: parseInt(problem["ex:timeLimit"]["#text"]),
      });
    }
  });

  return problems;
}
