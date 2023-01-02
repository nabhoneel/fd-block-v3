import { Profiler } from "react";

const callback = (id, phase, actualDuration, startTime, baseDuration, commitTime, interactions) => {
    console.log(
        "id " +
            id +
            " startTime " +
            startTime +
            " actualDuration " +
            actualDuration +
            " baseDuration " +
            baseDuration +
            " commitTime " +
            commitTime +
            " phase " +
            phase +
            " interactions " +
            interactions
    );
};

export { Profiler, callback };
