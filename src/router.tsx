import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { appLogger } from "./lib/logger";

appLogger.info('app_init', 'Router module loaded');

export const getRouter = () => {
  appLogger.info('app_init', 'Creating router instance');
  
  try {
    const queryClient = new QueryClient();
    appLogger.info('app_init', 'QueryClient created');

    const router = createRouter({
      routeTree,
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,
    });

    appLogger.info('app_init', 'Router created successfully', {
      routeCount: Object.keys(routeTree).length,
    });

    return router;
  } catch (error) {
    appLogger.error('app_init', 'Failed to create router', {}, error as Error);
    throw error;
  }
};
