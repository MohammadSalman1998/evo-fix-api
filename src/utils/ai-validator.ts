// src\utils\ai-validator.ts
import { HfInference } from '@huggingface/inference';
import { googletrans } from 'googletrans';

interface AIValidationResult {
  isValid: boolean;
  confidence: number;
  message: string;
  suggestions?: string[];
}

interface MaintenanceRequest {
  deviceImage?: File;
  problemDescription: string;
}

interface TextClassificationParams {
  model: string;
  inputs: string;
  parameters: {
    candidate_labels: string[];
  };
}

interface ImageAnalysisResult {
  labels: string[];
  confidence: number;
}

interface HfImageClassificationResult {
  label: string;
  score: number;
}

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function translateToEnglish(text: string): Promise<string> {
  try {
    const translated = await googletrans(text, { from: 'ar', to: 'en' });
    return translated.text;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("فشل في ترجمة النص");
  }
}

async function analyzeImage(image: File): Promise<ImageAnalysisResult> {
  try {
    const imageBuffer = await image.arrayBuffer();
    const response = await hf.imageClassification({
      model: "microsoft/resnet-50",
      data: new Uint8Array(imageBuffer)
    }) as HfImageClassificationResult[];

    const relevantLabels = response.filter(result => 
      result.label.toLowerCase().includes('screen') ||
      result.label.toLowerCase().includes('display') ||
      result.label.toLowerCase().includes('monitor') ||
      result.label.toLowerCase().includes('phone') ||
      result.label.toLowerCase().includes('laptop') ||
      result.label.toLowerCase().includes('computer')
    );

    if (relevantLabels.length === 0) {
      return {
        labels: ["غير واضحة"],
        confidence: 0
      };
    }

    return {
      labels: relevantLabels.map(r => r.label),
      confidence: relevantLabels[0].score
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      labels: ["غير واضحة"],
      confidence: 0
    };
  }
}

export async function validateWithAI(request: MaintenanceRequest): Promise<AIValidationResult> {
  try {
    let imageAnalysis: ImageAnalysisResult = { labels: [], confidence: 0 };
    let textConfidence = 0;
    
    if (request.deviceImage) {
      imageAnalysis = await analyzeImage(request.deviceImage);
      console.log("تحليل الصورة:", imageAnalysis);
    }

    const translatedText = await translateToEnglish(request.problemDescription);
    
    const textAnalysis = await hf.request({
      model: "facebook/bart-large-mnli",
      inputs: translatedText,
      parameters: {
        candidate_labels: [
          "screen repair",
          "display issues",
          "monitor problems",
          "other maintenance"
        ]
      }
    } as TextClassificationParams);

    type TextAnalysisResult = { labels: string[]; scores: number[] };
    const typedTextAnalysis = textAnalysis as TextAnalysisResult;
    
    textConfidence = typedTextAnalysis.scores[0] || 0;

    const combinedConfidence = request.deviceImage ? 
      (imageAnalysis.confidence * 0.4 + textConfidence * 0.6) :
      textConfidence;

    // const isValid = combinedConfidence > 0.6;
    let isValid;
    if(request.deviceImage){
       isValid = (textConfidence > 0.4 || imageAnalysis.confidence > 0.6) && 
      (imageAnalysis.labels.some(label => label.toLowerCase().includes('screen') || 
      label.toLowerCase().includes('monitor') || 
      label.toLowerCase().includes('display')));
    }else{
      isValid = textConfidence > 0.4
    }


    let message: string;
    let suggestions: string[] | undefined;

    if (isValid) {
      message = `تم التحقق من صحة الطلب بثقة ${(combinedConfidence * 100).toFixed(1)}%`;
    } else {
      if (imageAnalysis.labels.includes("غير واضحة")) {
        message = "عذرًا، الصورة غير واضحة. يرجى إرفاق صورة أوضح للشاشة المعطلة.";
        suggestions = [
          "يرجى إرفاق صورة واضحة للشاشة المعطلة",
          "يرجى وصف المشكلة بشكل أكثر تفصيلاً"
        ];
      } else {
        message = "عذراً، لم نتمكن من التأكد من أن طلبك يتعلق بإصلاح الشاشات.";
        suggestions = [
          "يرجى إرفاق صورة واضحة للشاشة المعطلة",
          "يرجى وصف المشكلة بشكل أكثر تفصيلاً",
          "تأكد من أن طلبك يتعلق بإصلاح الشاشات"
        ];
      }
    }

    return {
      isValid,
      confidence: combinedConfidence,
      message,
      suggestions
    };
  } catch (error) {
    console.error('AI Validation Error:', error);
    throw new Error('فشل في التحقق من صحة الطلب');
  }
}
