"use client";

import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { GridBackground } from "../../../views/Home/components/GridBackground";

const NotFound = () => {
  return (
    <main className="-mt-[4rem] relative flex flex-1 w-full flex-col min-h-screen">
      <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
        <GridBackground />
      </div>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <h1 className="text-8xl font-bold relative">
              <span>404</span>
            </h1>
          </div>

          <div className="space-y-4 max-w-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Page non trouvée</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Désolé, nous n'avons pas trouvé la page que vous recherchez. Il est possible qu'elle ait été
              déplacée ou supprimée.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 gap-2"
          >
            <MoveLeft className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
