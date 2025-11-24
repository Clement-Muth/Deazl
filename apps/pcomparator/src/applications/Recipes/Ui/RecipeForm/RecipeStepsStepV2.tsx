"use client";

import { Button, Card, CardBody, CardHeader, Divider, Input, Textarea } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { Clock, Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";

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

  const [groups, setGroups] = useState<StepGroup[]>(() => {
    if (initialGroups && initialGroups.length > 0) {
      return initialGroups;
    }
    if (steps && steps.length > 0) {
      return [
        {
          name: "",
          order: 0,
          steps: steps.map((step, idx) => ({
            stepNumber: idx + 1,
            description: step.description || "",
            duration: step.duration
          }))
        }
      ];
    }
    return [{ name: "", order: 0, steps: [] }];
  });

  const isGroupMode = groups.length > 1 || (groups.length === 1 && groups[0].name !== "");
  const prevGroupsRef = useRef<string>("");

  useEffect(() => {
    const groupsStr = JSON.stringify(groups);
    if (onGroupsChange && prevGroupsRef.current !== groupsStr) {
      prevGroupsRef.current = groupsStr;
      onGroupsChange(isGroupMode ? groups : []);
    }
  }, [groups, isGroupMode]);

  const syncToSimpleMode = () => {
    const allSteps = groups.flatMap((group) => group.steps);

    setGroups([{ name: "", order: 0, steps: allSteps }]);

    const currentCount = steps?.length || 0;
    for (let i = currentCount - 1; i >= 0; i--) {
      onRemoveStep(i);
    }

    for (const _ of allSteps) {
      onAddStep();
    }

    setTimeout(() => {
      allSteps.forEach((step, idx) => {
        onUpdateStep(idx, "_batch", {
          stepNumber: idx + 1,
          description: step.description,
          duration: step.duration
        });
      });
    }, 0);
  };

  const handleAddGroup = () => {
    const newGroups = [...groups, { name: "", order: groups.length, steps: [] }];
    setGroups(newGroups);
  };

  const handleDuplicateGroup = (groupIndex: number) => {
    const groupToDuplicate = groups[groupIndex];
    const newGroup: StepGroup = {
      ...groupToDuplicate,
      name: `${groupToDuplicate.name} (Copy)`,
      order: groups.length,
      steps: groupToDuplicate.steps.map((step) => ({ ...step }))
    };
    const newGroups = [...groups, newGroup];

    let stepNumber = 1;
    for (const group of newGroups) {
      for (const step of group.steps) {
        step.stepNumber = stepNumber++;
      }
    }
    setGroups(newGroups);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    if (groups.length === 1) return;
    const newGroups = groups.filter((_, idx) => idx !== groupIndex);

    let stepNumber = 1;
    for (const group of newGroups) {
      for (const step of group.steps) {
        step.stepNumber = stepNumber++;
      }
    }
    setGroups(newGroups);
  };

  const handleUpdateGroupName = (groupIndex: number, name: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex].name = name;
    setGroups(newGroups);
  };

  const handleAddStepToGroup = (groupIndex: number) => {
    const newGroups = [...groups];
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
  };

  const handleDuplicateStep = (groupIndex: number, stepIndex: number) => {
    const newGroups = [...groups];
    const stepToDuplicate = newGroups[groupIndex].steps[stepIndex];
    newGroups[groupIndex].steps.splice(stepIndex + 1, 0, {
      ...stepToDuplicate,
      stepNumber: stepToDuplicate.stepNumber + 1
    });

    let stepNumber = 1;
    for (const group of newGroups) {
      for (const step of group.steps) {
        step.stepNumber = stepNumber++;
      }
    }
    setGroups(newGroups);
  };

  const handleRemoveStepFromGroup = (groupIndex: number, stepIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].steps = newGroups[groupIndex].steps.filter((_, idx) => idx !== stepIndex);

    let stepNumber = 1;
    for (const group of newGroups) {
      for (const step of group.steps) {
        step.stepNumber = stepNumber++;
      }
    }
    setGroups(newGroups);
  };

  const handleUpdateStepInGroup = (groupIndex: number, stepIndex: number, field: string, value: any) => {
    const newGroups = [...groups];
    newGroups[groupIndex].steps[stepIndex] = {
      ...newGroups[groupIndex].steps[stepIndex],
      [field]: value
    };
    setGroups(newGroups);
  };

  if (isGroupMode) {
    return (
      <Card>
        <CardHeader className="border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              <Trans>Preparation Steps</Trans>
            </h2>
            <Button
              color="primary"
              size="sm"
              onPress={handleAddGroup}
              startContent={<Plus className="w-4 h-4" />}
            >
              <Trans>Add Group</Trans>
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <Trans>
                Group your steps by phase (e.g., Preparation, Cooking, Finishing). This helps structure
                complex recipes.
              </Trans>
            </p>
          </div>

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
                  <Button
                    isIconOnly
                    color="secondary"
                    variant="light"
                    onPress={() => handleDuplicateGroup(groupIndex)}
                    size="lg"
                    aria-label={t`Duplicate group`}
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
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
                      <div className="flex-1 space-y-2">
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
                          placeholder={t`Duration (optional)`}
                          startContent={<Clock className="w-4 h-4 text-default-400" />}
                          endContent={<span className="text-xs text-default-400">min</span>}
                          variant="bordered"
                          min={1}
                          className="max-w-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          color="secondary"
                          variant="light"
                          onPress={() => handleDuplicateStep(groupIndex, stepIndex)}
                          size="lg"
                          aria-label={t`Duplicate step`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onPress={() => handleRemoveStepFromGroup(groupIndex, stepIndex)}
                          size="lg"
                          aria-label={t`Remove step`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  color="secondary"
                  variant="flat"
                  onPress={() => handleAddStepToGroup(groupIndex)}
                  startContent={<Plus className="w-4 h-4" />}
                  className="w-full mt-3"
                >
                  <Trans>Add Step</Trans>
                </Button>
              </Card>
            ))}
          </div>

          <Button color="default" variant="light" onPress={syncToSimpleMode} size="sm" className="mt-4">
            <Trans>Switch to Simple List</Trans>
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Trans>Preparation Steps</Trans>
        </h2>
      </CardHeader>
      <CardBody className="p-4 sm:p-6">
        <div className="mb-4 p-3 bg-default-100 rounded-lg">
          <p className="text-sm text-default-600">
            <Trans>
              Describe each step of your recipe. For complex recipes, you can organize them into groups.
            </Trans>
          </p>
        </div>

        <div className="space-y-3">
          {steps?.map((step, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start p-3 rounded-lg border border-divider bg-background"
            >
              <div className="shrink-0 w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={step.description || ""}
                  onValueChange={(value) => onUpdateStep(index, "description", value)}
                  isRequired
                  placeholder={t`Describe this step in detail...`}
                  variant="bordered"
                  minRows={3}
                  maxRows={10}
                />
                <Input
                  type="number"
                  value={step.duration?.toString() || ""}
                  onValueChange={(value) =>
                    onUpdateStep(index, "duration", value ? Number.parseInt(value) : null)
                  }
                  placeholder={t`Duration (optional)`}
                  startContent={<Clock className="w-4 h-4 text-default-400" />}
                  endContent={<span className="text-xs text-default-400">min</span>}
                  variant="bordered"
                  min={1}
                  className="max-w-xs"
                />
              </div>
              <Button
                isIconOnly
                color="danger"
                variant="light"
                onPress={() => onRemoveStep(index)}
                size="lg"
                aria-label={t`Remove step`}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            color="primary"
            variant="flat"
            onPress={onAddStep}
            startContent={<Plus className="w-4 h-4" />}
            className="flex-1"
          >
            <Trans>Add Step</Trans>
          </Button>
          {steps && steps.length > 0 && (
            <Button
              color="secondary"
              variant="light"
              onPress={() => {
                const newGroups: StepGroup[] = [
                  {
                    name: "",
                    order: 0,
                    steps: steps.map((step, idx) => ({
                      stepNumber: idx + 1,
                      description: step.description || "",
                      duration: step.duration
                    }))
                  },
                  { name: "", order: 1, steps: [] }
                ];
                setGroups(newGroups);
              }}
              size="sm"
            >
              <Trans>Organize in Groups</Trans>
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
