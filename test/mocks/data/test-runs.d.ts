export declare const mockTestRuns: {
    id: number;
    name: string;
    project_id: number;
    execution_environment_id: number;
    status: string;
    statuses: {
        passed: number;
        failed: number;
        skipped: number;
        undefined: number;
        blocked: number;
    };
    created_at: string;
    updated_at: string;
}[];
export declare const mockTestExecutions: ({
    id: number;
    test_run_id: number;
    scenario_id: number;
    status: string;
    description: string;
    created_at: string;
    updated_at: string;
    error_message?: undefined;
} | {
    id: number;
    test_run_id: number;
    scenario_id: number;
    status: string;
    description: string;
    error_message: string;
    created_at: string;
    updated_at: string;
})[];
export declare const mockBuilds: {
    id: number;
    name: string;
    project_id: number;
    status: string;
    test_runs_count: number;
    scenarios_count: number;
    created_at: string;
    updated_at: string;
}[];
export declare const mockExecutionEnvironments: {
    id: number;
    name: string;
    project_id: number;
    description: string;
    created_at: string;
    updated_at: string;
}[];
export declare const mockTestRun: {
    id: number;
    name: string;
    project_id: number;
    execution_environment_id: number;
    status: string;
    statuses: {
        passed: number;
        failed: number;
        skipped: number;
        undefined: number;
        blocked: number;
    };
    created_at: string;
    updated_at: string;
};
export declare const mockBuild: {
    id: number;
    name: string;
    project_id: number;
    status: string;
    test_runs_count: number;
    scenarios_count: number;
    created_at: string;
    updated_at: string;
};
//# sourceMappingURL=test-runs.d.ts.map