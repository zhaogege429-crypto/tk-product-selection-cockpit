export interface TKReport {
  conclusion: {
    level: string; // "优先做" | "可以测试" | "谨慎进入" | "不建议做"
    summary: string;
  };
  adaptability: {
    contentSellability: string; // "高" | "中" | "低"
    conversionPotential: string; // "高" | "中" | "低"
    trafficScaling: string; // "高" | "中" | "低"
    riskLevel: string; // "低" | "中" | "高"
    reasons: string[];
  };
  recommendedPath: {
    path: string; // "短视频自然流" | "短视频付费投流" | "达人分销" | "直播带货" | "组合打法" | "暂不建议"
    reason: string;
  };
  sellingPoints: string[];
  operationsAdvice: string[];
  missingInfo: {
    missingFields: string[];
    impact: string;
  };
}

export interface FormData {
  name: string;
  category: string;
  price: string;
  sellingPoints: string;
  audience: string;
  extra: string;
}
