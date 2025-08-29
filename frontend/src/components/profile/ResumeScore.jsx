import React, { useEffect, useState } from "react";
import { getResumeScore } from "../../services/resumeService";
import Loading from "../common/Loading";

const ResumeScore = ({ applicationId }) => {
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!applicationId) {
            setError("No application selected.");
            setLoading(false);
            return;
        }
        const fetchScore = async () => {
            try {
                const data = await getResumeScore(applicationId);
                setScore(data.resumeScore.score);
                setFeedback(data.resumeScore.details);
            } catch {
                setError("Could not fetch resume score.");
            } finally {
                setLoading(false);
            }
        };

        fetchScore();
    }, [applicationId]);

    if (loading) return <Loading />;

    return (
        <div className="p-5 bg-white border rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Resume Score</h3>
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : score !== null ? (
                <>
                    <div className="text-4xl font-extrabold text-indigo-600">{score}/100</div>
                    <p className="mt-3 text-gray-700 whitespace-pre-line">{feedback}</p>
                </>
            ) : (
                <p className="text-gray-500">No resume score available.</p>
            )}
        </div>
    );
};

export default ResumeScore;
