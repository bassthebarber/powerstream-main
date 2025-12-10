import { triggerAIBuilder } from "@/components/ai/core/controllers/LogicEngine";

export const handleTerminalCommand = (input) => {
  triggerAIBuilder(input);
};
