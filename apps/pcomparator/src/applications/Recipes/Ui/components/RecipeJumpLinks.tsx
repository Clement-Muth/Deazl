"use client";

import { Button, ScrollShadow } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { ChefHat, Heart, List, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface RecipeJumpLinksProps {
  hasNutrition?: boolean;
  hasTips?: boolean;
}

type SectionId = "ingredients" | "preparation" | "nutrition" | "tips";

const sections: Array<{ id: SectionId; icon: typeof List; labelKey: string }> = [
  { id: "ingredients", icon: List, labelKey: "Ingredients" },
  { id: "preparation", icon: ChefHat, labelKey: "Steps" },
  { id: "nutrition", icon: Heart, labelKey: "Nutrition" },
  { id: "tips", icon: Sparkles, labelKey: "Tips" }
];

export function RecipeJumpLinks({ hasNutrition = true, hasTips = true }: RecipeJumpLinksProps) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  const visibleSections = sections.filter((section) => {
    if (section.id === "nutrition" && !hasNutrition) return false;
    if (section.id === "tips" && !hasTips) return false;
    return true;
  });

  const scrollToSection = useCallback((sectionId: SectionId) => {
    const element = document.getElementById(`recipe-${sectionId}`);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      for (const section of [...visibleSections].reverse()) {
        const element = document.getElementById(`recipe-${section.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.id);
            return;
          }
        }
      }
      setActiveSection(null);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleSections]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Recipe sections"
      className="bg-content2/50 rounded-xl p-1"
    >
      <ScrollShadow orientation="horizontal" hideScrollBar>
        <div className="flex gap-1">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <Button
                key={section.id}
                size="sm"
                variant={isActive ? "solid" : "light"}
                color={isActive ? "primary" : "default"}
                startContent={<Icon className="w-4 h-4 shrink-0" />}
                onPress={() => scrollToSection(section.id)}
                className={`shrink-0 min-w-11 min-h-11 touch-manipulation ${isActive ? "" : "text-default-600"}`}
              >
                <span className="whitespace-nowrap text-sm">
                  {section.labelKey === "Ingredients" && <Trans>Ingredients</Trans>}
                  {section.labelKey === "Steps" && <Trans>Steps</Trans>}
                  {section.labelKey === "Nutrition" && <Trans>Nutrition</Trans>}
                  {section.labelKey === "Tips" && <Trans>Tips</Trans>}
                </span>
              </Button>
            );
          })}
        </div>
      </ScrollShadow>
    </motion.nav>
  );
}
