import express from "express";

export class RouteFactory {
    static createCustomRoutes(
        routes: Array<{
            method: "get" | "post" | "put" | "delete" | "use";
            path: string;
            handler: any;
            middleware?: any[];
        }>
    ) {
        const router = express.Router();

        routes.forEach((route) => {
            router[route.method](
                route.path,
                ...(route.middleware || []),
                route.handler
            );
        });

        return router;
    }
}