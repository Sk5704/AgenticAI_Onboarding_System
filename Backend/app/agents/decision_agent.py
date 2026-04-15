async def make_decision(risk_result, compliance_result, face_result):
    """
    Final decision based on risk score, compliance, and face match.
    """
    risk_score = risk_result.get("score", 100)
    compliance_passed = compliance_result.get("status") == "passed"
    face_match_score = face_result.get("match_score", 0.0)

    if compliance_passed and risk_score < 50 and face_match_score > 0.8:
        decision = "approve"
    else:
        decision = "reject"

    return {"decision": decision, "reason": f"risk={risk_score}, compliance={compliance_passed}, face={face_match_score}"}