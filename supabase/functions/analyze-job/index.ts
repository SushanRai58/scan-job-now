import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { jobInput, jobUrl } = await req.json();

    console.log('Analyzing job for user:', user.id);
    console.log('Job input length:', jobInput?.length || 0);
    console.log('Job URL:', jobUrl || 'none');

    // Simulate AI analysis (in production, this would call your ML API)
    // For now, we'll use simple keyword detection
    const suspiciousKeywords = [
      'wire transfer', 'upfront payment', 'no interview', 'immediate start',
      'work from home guaranteed', 'easy money', 'pay fee', 'training fee',
      'send money', 'bank account', 'social security', 'processing fee'
    ];

    const legitimateKeywords = [
      'company website', 'office location', 'benefits package', 'interview process',
      'job requirements', 'qualifications', 'responsibilities', 'team', 'company culture'
    ];

    const text = (jobInput || '').toLowerCase();
    const detectedSuspicious = suspiciousKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    const detectedLegitimate = legitimateKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );

    // Simple scoring algorithm
    const suspiciousScore = detectedSuspicious.length * 15;
    const legitimateScore = detectedLegitimate.length * 10;
    const baseScore = 50;
    
    const finalScore = Math.max(0, Math.min(100, 
      baseScore - suspiciousScore + legitimateScore
    ));

    const classification = finalScore >= 50 ? 'legitimate' : 'fake';
    const confidence = Math.abs(finalScore - 50) * 2;

    const allKeywords = [
      ...detectedSuspicious.map(k => ({ keyword: k, type: 'suspicious' })),
      ...detectedLegitimate.map(k => ({ keyword: k, type: 'legitimate' }))
    ];

    const explanation = classification === 'legitimate'
      ? `This job posting appears legitimate based on the presence of standard job posting elements like ${detectedLegitimate.slice(0, 2).join(', ')}. However, always verify the company independently.`
      : `This job posting shows several red flags including: ${detectedSuspicious.slice(0, 3).join(', ')}. Be cautious and verify the company independently before proceeding.`;

    // Store the analysis in the database
    const { data: analysisData, error: insertError } = await supabase
      .from('job_analyses')
      .insert({
        user_id: user.id,
        job_description: jobInput,
        job_url: jobUrl,
        classification: classification,
        confidence_score: Math.round(confidence),
        detected_keywords: allKeywords.map(k => k.keyword),
        explanation: explanation
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting analysis:', insertError);
      throw insertError;
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          classification,
          confidence: Math.round(confidence),
          keywords: allKeywords.map(k => k.keyword),
          explanation,
          analysisId: analysisData.id
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-job function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});