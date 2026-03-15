/**
 * Lightroom XMP 预设文件生成器
 *
 * 格式完全对齐 Adobe Lightroom Mobile / Classic 标准：
 * - ProcessVersion="6.7"（手机 LR 兼容性最佳）
 * - 包含 PresetType、UUID、SupportsAmount 等预设元数据
 * - 包含 <crs:Name> 和 <crs:Group> 子节点（手机 LR 识别预设名称必需）
 * - 包含 SplitToning、ParametricCurve、PostCropVignette、Grain 等完整字段
 * - Exposure2012 值带正负号格式（如 "+0.50"、"-0.30"）
 * - Tint 值带正负号格式（如 "+3"、"-5"）
 */

/** 生成随机 UUID（格式：8-4-4-4-12） */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).toUpperCase();
  });
}

/** 将数值格式化为带正负号的字符串，如 +25、-15、0 */
function signedInt(v) {
  const n = Math.round(v);
  if (n > 0) return `+${n}`;
  return `${n}`;
}

/** 将浮点曝光值格式化为带正负号的字符串，如 +0.50、-0.30 */
function signedFloat(v, decimals = 2) {
  const n = parseFloat(v.toFixed(decimals));
  if (n > 0) return `+${n.toFixed(decimals)}`;
  return n.toFixed(decimals);
}

export function generateXMP(params, presetName = 'ColorMatch_Preset') {
  const {
    Temperature, Tint, Exposure, Contrast,
    Highlights, Shadows, Whites, Blacks,
    Clarity, Dehaze, Vibrance, Saturation,
    HueAdjustmentRed, HueAdjustmentOrange, HueAdjustmentYellow,
    HueAdjustmentGreen, HueAdjustmentAqua, HueAdjustmentBlue,
    HueAdjustmentPurple, HueAdjustmentMagenta,
    SaturationAdjustmentRed, SaturationAdjustmentOrange, SaturationAdjustmentYellow,
    SaturationAdjustmentGreen, SaturationAdjustmentAqua, SaturationAdjustmentBlue,
    SaturationAdjustmentPurple, SaturationAdjustmentMagenta,
    LuminanceAdjustmentRed, LuminanceAdjustmentOrange, LuminanceAdjustmentYellow,
    LuminanceAdjustmentGreen, LuminanceAdjustmentAqua, LuminanceAdjustmentBlue,
    LuminanceAdjustmentPurple, LuminanceAdjustmentMagenta,
    ToneCurvePV2012, ToneCurvePV2012Red, ToneCurvePV2012Green, ToneCurvePV2012Blue,
    ColorGradeShadowHue, ColorGradeShadowSat,
    ColorGradeHighlightHue, ColorGradeHighlightSat,
    ColorGradeMidtoneHue, ColorGradeMidtoneSat,
    ColorGradeBlending,
    Sharpness, SharpenRadius, SharpenDetail, SharpenEdgeMasking,
    LuminanceSmoothing, LuminanceNoiseReductionDetail,
    ColorNoiseReduction, ColorNoiseReductionDetail, ColorNoiseReductionSmoothness,
  } = params;

  const uuid = generateUUID();
  // 安全的预设名（去掉特殊字符）
  const safeName = presetName.replace(/[<>&"']/g, '_');

  const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c140 79.160451, 2017/05/06-01:08:21">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
   crs:PresetType="Normal"
   crs:UUID="${uuid}"
   crs:SupportsAmount="False"
   crs:SupportsColor="True"
   crs:SupportsMonochrome="False"
   crs:SupportsHighDynamicRange="True"
   crs:SupportsNormalDynamicRange="True"
   crs:SupportsSceneReferred="True"
   crs:SupportsOutputReferred="True"
   crs:CameraModelRestriction=""
   crs:Copyright=""
   crs:ContactInfo=""
   crs:Version="11.3"
   crs:ProcessVersion="6.7"
   crs:WhiteBalance="Custom"
   crs:Temperature="${Temperature}"
   crs:Tint="${signedInt(Tint)}"
   crs:Saturation="${signedInt(Saturation)}"
   crs:Sharpness="${Sharpness}"
   crs:LuminanceSmoothing="${LuminanceSmoothing}"
   crs:ColorNoiseReduction="${ColorNoiseReduction}"
   crs:VignetteAmount="0"
   crs:ShadowTint="0"
   crs:RedHue="0"
   crs:RedSaturation="0"
   crs:GreenHue="0"
   crs:GreenSaturation="0"
   crs:BlueHue="0"
   crs:BlueSaturation="0"
   crs:Vibrance="${signedInt(Vibrance)}"
   crs:HueAdjustmentRed="${signedInt(HueAdjustmentRed)}"
   crs:HueAdjustmentOrange="${signedInt(HueAdjustmentOrange)}"
   crs:HueAdjustmentYellow="${signedInt(HueAdjustmentYellow)}"
   crs:HueAdjustmentGreen="${signedInt(HueAdjustmentGreen)}"
   crs:HueAdjustmentAqua="${signedInt(HueAdjustmentAqua)}"
   crs:HueAdjustmentBlue="${signedInt(HueAdjustmentBlue)}"
   crs:HueAdjustmentPurple="${signedInt(HueAdjustmentPurple)}"
   crs:HueAdjustmentMagenta="${signedInt(HueAdjustmentMagenta)}"
   crs:SaturationAdjustmentRed="${signedInt(SaturationAdjustmentRed)}"
   crs:SaturationAdjustmentOrange="${signedInt(SaturationAdjustmentOrange)}"
   crs:SaturationAdjustmentYellow="${signedInt(SaturationAdjustmentYellow)}"
   crs:SaturationAdjustmentGreen="${signedInt(SaturationAdjustmentGreen)}"
   crs:SaturationAdjustmentAqua="${signedInt(SaturationAdjustmentAqua)}"
   crs:SaturationAdjustmentBlue="${signedInt(SaturationAdjustmentBlue)}"
   crs:SaturationAdjustmentPurple="${signedInt(SaturationAdjustmentPurple)}"
   crs:SaturationAdjustmentMagenta="${signedInt(SaturationAdjustmentMagenta)}"
   crs:LuminanceAdjustmentRed="${signedInt(LuminanceAdjustmentRed)}"
   crs:LuminanceAdjustmentOrange="${signedInt(LuminanceAdjustmentOrange)}"
   crs:LuminanceAdjustmentYellow="${signedInt(LuminanceAdjustmentYellow)}"
   crs:LuminanceAdjustmentGreen="${signedInt(LuminanceAdjustmentGreen)}"
   crs:LuminanceAdjustmentAqua="${signedInt(LuminanceAdjustmentAqua)}"
   crs:LuminanceAdjustmentBlue="${signedInt(LuminanceAdjustmentBlue)}"
   crs:LuminanceAdjustmentPurple="${signedInt(LuminanceAdjustmentPurple)}"
   crs:LuminanceAdjustmentMagenta="${signedInt(LuminanceAdjustmentMagenta)}"
   crs:SplitToningShadowHue="${ColorGradeShadowHue}"
   crs:SplitToningShadowSaturation="${ColorGradeShadowSat}"
   crs:SplitToningHighlightHue="${ColorGradeHighlightHue}"
   crs:SplitToningHighlightSaturation="${ColorGradeHighlightSat}"
   crs:SplitToningBalance="0"
   crs:ParametricShadows="${signedInt(Math.max(-100, Math.min(100, Shadows * 0.4)))}"
   crs:ParametricDarks="${signedInt(Math.max(-100, Math.min(100, Shadows * 0.3)))}"
   crs:ParametricLights="${signedInt(Math.max(-100, Math.min(100, Highlights * 0.3)))}"
   crs:ParametricHighlights="${signedInt(Math.max(-100, Math.min(100, Highlights * 0.4)))}"
   crs:ParametricShadowSplit="25"
   crs:ParametricMidtoneSplit="50"
   crs:ParametricHighlightSplit="75"
   crs:SharpenRadius="+${Math.max(0.5, Math.min(3.0, SharpenRadius)).toFixed(1)}"
   crs:SharpenDetail="${SharpenDetail}"
   crs:SharpenEdgeMasking="${SharpenEdgeMasking}"
   crs:PostCropVignetteAmount="0"
   crs:PostCropVignetteMidpoint="50"
   crs:PostCropVignetteFeather="50"
   crs:PostCropVignetteRoundness="0"
   crs:PostCropVignetteStyle="1"
   crs:PostCropVignetteHighlightContrast="0"
   crs:GrainAmount="0"
   crs:GrainSize="25"
   crs:GrainRoughness="50"
   crs:ColorNoiseReductionDetail="${ColorNoiseReductionDetail}"
   crs:ColorNoiseReductionSmoothness="${ColorNoiseReductionSmoothness}"
   crs:LensProfileEnable="0"
   crs:LensManualDistortionAmount="0"
   crs:PerspectiveVertical="0"
   crs:PerspectiveHorizontal="0"
   crs:PerspectiveRotate="0.0"
   crs:PerspectiveScale="100"
   crs:PerspectiveAspect="0"
   crs:PerspectiveUpright="0"
   crs:PerspectiveX="0.00"
   crs:PerspectiveY="0.00"
   crs:AutoLateralCA="1"
   crs:Exposure2012="${signedFloat(Exposure)}"
   crs:Contrast2012="${signedInt(Contrast)}"
   crs:Highlights2012="${signedInt(Highlights)}"
   crs:Shadows2012="${signedInt(Shadows)}"
   crs:Whites2012="${signedInt(Whites)}"
   crs:Blacks2012="${signedInt(Blacks)}"
   crs:Clarity2012="${signedInt(Clarity)}"
   crs:DefringePurpleAmount="0"
   crs:DefringePurpleHueLo="30"
   crs:DefringePurpleHueHi="70"
   crs:DefringeGreenAmount="0"
   crs:DefringeGreenHueLo="40"
   crs:DefringeGreenHueHi="60"
   crs:Dehaze="${signedInt(Dehaze)}"
   crs:ConvertToGrayscale="False"
   crs:OverrideLookVignette="True"
   crs:ToneCurveName2012="Custom"
   crs:CameraProfile="Adobe Color"
   crs:LensProfileSetup="LensDefaults"
   crs:HasSettings="True">
   <crs:Name>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${safeName}</rdf:li>
    </rdf:Alt>
   </crs:Name>
   <crs:Group>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${safeName}</rdf:li>
    </rdf:Alt>
   </crs:Group>
   <crs:ToneCurvePV2012>
    <rdf:Seq>
${ToneCurvePV2012.map(([x, y]) => `     <rdf:li>${x}, ${y}</rdf:li>`).join('\n')}
    </rdf:Seq>
   </crs:ToneCurvePV2012>
   <crs:ToneCurvePV2012Red>
    <rdf:Seq>
${ToneCurvePV2012Red.map(([x, y]) => `     <rdf:li>${x}, ${y}</rdf:li>`).join('\n')}
    </rdf:Seq>
   </crs:ToneCurvePV2012Red>
   <crs:ToneCurvePV2012Green>
    <rdf:Seq>
${ToneCurvePV2012Green.map(([x, y]) => `     <rdf:li>${x}, ${y}</rdf:li>`).join('\n')}
    </rdf:Seq>
   </crs:ToneCurvePV2012Green>
   <crs:ToneCurvePV2012Blue>
    <rdf:Seq>
${ToneCurvePV2012Blue.map(([x, y]) => `     <rdf:li>${x}, ${y}</rdf:li>`).join('\n')}
    </rdf:Seq>
   </crs:ToneCurvePV2012Blue>
   <crs:Look
    crs:Name=""/>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`;

  return xmp;
}

/**
 * 触发 XMP 文件下载
 */
export function downloadXMP(xmpContent, filename = 'ColorMatch_Preset.xmp') {
  const blob = new Blob([xmpContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
