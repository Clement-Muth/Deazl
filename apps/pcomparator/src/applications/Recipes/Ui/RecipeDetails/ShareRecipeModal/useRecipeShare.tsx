import { addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useCallback, useEffect, useState } from "react";
import { addCollaborator } from "../../../Api/recipes/share/addCollaborator.api";
import { generateShareLink } from "../../../Api/recipes/share/generateShareLink.api";
import { getCollaborators } from "../../../Api/recipes/share/getCollaborators.api";
import type { RecipeCollaborator } from "../../../Domain/Entities/RecipeCollaborator.entity";

type Collaborator = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
};

const transformCollaborator = (dbCollaborator: RecipeCollaborator): Collaborator => ({
  id: dbCollaborator.collaboratorId,
  userId: dbCollaborator.userId,
  name: dbCollaborator.user?.name || "",
  email: dbCollaborator.user?.email || "",
  avatar: dbCollaborator.user?.image || undefined,
  role: dbCollaborator.role as any
});

export const useRecipeShare = (recipeId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const generateLink = useCallback(async () => {
    try {
      setIsLoading(true);
      const link = await generateShareLink(recipeId);
      setShareLink(link);
    } catch (error) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to generate share link</Trans>,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  const inviteCollaborator = useCallback(
    async (email: string, role: "EDITOR" | "VIEWER") => {
      try {
        setIsLoading(true);
        await addCollaborator({ recipeId, email, role });

        const updatedCollaborators = await getCollaborators(recipeId);
        // @ts-ignore
        setCollaborators(updatedCollaborators.map(transformCollaborator));

        addToast({
          title: <Trans>Success</Trans>,
          description: <Trans>Collaborator invited successfully</Trans>,
          color: "success"
        });
      } catch (error) {
        addToast({
          title: <Trans>Error</Trans>,
          description: <Trans>Failed to invite collaborator</Trans>,
          color: "danger"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [recipeId]
  );

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const dbCollaborators = await getCollaborators(recipeId);
        // @ts-ignore
        setCollaborators(dbCollaborators.map(transformCollaborator));
      } catch (error) {
        console.error("Failed to fetch collaborators:", error);
      }
    };

    fetchCollaborators();
  }, [recipeId]);

  return {
    isLoading,
    shareLink,
    collaborators,
    generateLink,
    inviteCollaborator
  };
};
