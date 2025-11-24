"use client";

import { Button, Card, CardBody, CardHeader, Divider, Input, Textarea } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { FolderIcon, ListIcon, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { ModeToggleHelp } from "./ModeToggleHelp";

interface StepGroup {
  name: string;
  order: number;
  steps: Array<{
    stepNumber: number;
    description: string;
    duration?: number | null;
  }>;
}

interface RecipeStepsStepProps {
  steps: CreateRecipePayload["steps"];
  stepGroups?: StepGroup[];
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onUpdateStep: (index: number, field: string, value: any) => void;
  onGroupsChange?: (groups: StepGroup[]) => void;
}

export const RecipeStepsStep = ({
  steps,
  stepGroups: initialGroups,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
  onGroupsChange
}: RecipeStepsStepProps) => {
  const { t } = useLingui();
  const [useGroups, setUseGroups] = useState(!!initialGroups && initialGroups.length > 0);
  const [groups, setGroups] = useState<StepGroup[]>(
    initialGroups && initialGroups.length > 0 ? initialGroups : [{ name: "", order: 0, steps: [] }]
  );

  const handleToggleMode = () => {
    if (!useGroups) {
      // Switching to group mode - clear simple steps
      if (onGroupsChange) {
        onGroupsChange([{ name: "", order: 0, steps: [] }]);
      }
      setGroups([{ name: "", order: 0, steps: [] }]);
      // Clear simple steps by removing each one from end to start
      const count = steps?.length || 0;
      for (let i = count - 1; i >= 0; i--) {
        onRemoveStep(i);
      }
    } else {
      // Switching to simple mode - clear groups
      if (onGroupsChange) {
        onGroupsChange([]);
      }
      setGroups([]);
      // Add one empty step
      if (!steps || steps.length === 0) {
        onAddStep();
      }
    }
    setUseGroups(!useGroups);
  };

  const handleAddGroup = () => {
    const newGroups = [...groups, { name: "", order: groups.length, steps: [] }];
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    if (groups.length === 1) return;
    const newGroups = groups.filter((_, idx) => idx !== groupIndex);
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleUpdateGroupName = (groupIndex: number, name: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex].name = name;
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleAddStepToGroup = (groupIndex: number) => {
    const newGroups = [...groups];
    // Calculate continuous step number across all groups
    let totalSteps = 0;
    for (let i = 0; i <= groupIndex; i++) {
      totalSteps += newGroups[i].steps.length;
    }
    newGroups[groupIndex].steps.push({
      stepNumber: totalSteps + 1,
      description: "",
      duration: null
    });
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleRemoveStepFromGroup = (groupIndex: number, stepIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].steps = newGroups[groupIndex].steps.filter((_, idx) => idx !== stepIndex);
    // Recalculate step numbers to maintain continuity
    let stepNumber = 1;
    for (const group of newGroups) {
      for (const step of group.steps) {
        step.stepNumber = stepNumber++;
      }
    }
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleUpdateStepInGroup = (groupIndex: number, stepIndex: number, field: string, value: any) => {
    const newGroups = [...groups];
    newGroups[groupIndex].steps[stepIndex] = {
      ...newGroups[groupIndex].steps[stepIndex],
      [field]: value
    };
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  return (
    <Card>
      <CardHeader className="border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            <Trans>Preparation Steps</Trans>
          </h2>
          <Button
            variant={useGroups ? "solid" : "bordered"}
            color="primary"
            onPress={handleToggleMode}
            startContent={useGroups ? <FolderIcon className="w-4 h-4" /> : <ListIcon className="w-4 h-4" />}
            size="sm"
            className="min-w-32"
          >
            {useGroups ? <Trans>Organized</Trans> : <Trans>Simple List</Trans>}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-4 sm:p-6">
        <ModeToggleHelp type="steps" isGroupMode={useGroups} />
        {useGroups ? (
          <div className="space-y-6">
            {groups.map((group, groupIndex) => (
              <Card key={groupIndex} className="p-4 bg-default-50">
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    label={<Trans>Group Name</Trans>}
                    placeholder={t`e.g., Preparation, Cooking, Finishing`}
                    value={group.name}
                    onValueChange={(value) => handleUpdateGroupName(groupIndex, value)}
                    className="flex-1"
                    isRequired
                    variant="bordered"
                  />
                  {groups.length > 1 && (
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => handleRemoveGroup(groupIndex)}
                      size="lg"
                      aria-label={t`Remove group`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                <Divider className="my-4" />

                <div className="space-y-3">
                  {group.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start p-3 rounded-lg border border-divider bg-background"
                    >
                      <div className="shrink-0 w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-semibold">
                        {step.stepNumber}
                      </div>
                      <Textarea
                        value={step.description}
                        onValueChange={(value) =>
                          handleUpdateStepInGroup(groupIndex, stepIndex, "description", value)
                        }
                        isRequired
                        placeholder={t`Describe this step in detail...`}
                        variant="bordered"
                        minRows={3}
                        maxRows={10}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={step.duration?.toString() || ""}
                        onValueChange={(value) =>
                          handleUpdateStepInGroup(
                            groupIndex,
                            stepIndex,
                            "duration",
                            value ? Number.parseInt(value) : null
                          )
                        }
                        min={1}
                        placeholder={t`Duration (min)`}
                        variant="bordered"
                        className="w-full sm:w-32"
                        label={t`Time`}
                      />
                      <Button
                        isIconOnly
                        color="danger"
                        variant="flat"
                        onPress={() => handleRemoveStepFromGroup(groupIndex, stepIndex)}
                        className="shrink-0 self-start sm:self-center"
                        aria-label={t`Remove step`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="flat"
                  color="primary"
                  onPress={() => handleAddStepToGroup(groupIndex)}
                  startContent={<Plus className="w-4 h-4" />}
                  className="mt-3 w-full"
                  size="sm"
                >
                  <Trans>Add step</Trans>
                </Button>
              </Card>
            ))}

            <Button
              variant="bordered"
              color="primary"
              onPress={handleAddGroup}
              startContent={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              <Trans>Add Group</Trans>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {(steps || []).map((step, index) => (
              <div key={index} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start p-3 rounded-lg border border-divider bg-default-50">
                  <div className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    {step.stepNumber}
                  </div>
                  <Textarea
                    value={step.description}
                    onValueChange={(value) => onUpdateStep(index, "description", value)}
                    isRequired
                    placeholder={t`Describe this step in detail...`}
                    variant="bordered"
                    minRows={3}
                    maxRows={10}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={step.duration?.toString() || ""}
                    onValueChange={(value) =>
                      onUpdateStep(index, "duration", value ? Number.parseInt(value) : null)
                    }
                    min={1}
                    placeholder={t`Duration (min)`}
                    variant="bordered"
                    className="w-full sm:w-32"
                    label={t`Time`}
                  />
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onRemoveStep(index)}
                    className="shrink-0 self-start sm:self-center"
                    aria-label={t`Remove step`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  color="success"
                  variant="bordered"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={onAddStep}
                  size="sm"
                  className="w-full"
                >
                  <Trans>Add step</Trans>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
