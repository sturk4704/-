/**
 * مساعد رفع وضغط الصور الشخصية لبطاقات فيفا في منصة كابتن جدة
 * يقوم بضغط وتصغير الصورة بتقنية Canvas لإنتاج Base64 خفيف وعالي الدقة
 * يعمل بسرعة فائقة وبدون أي مشاكل في إعدادات التخزين السحابي
 */

export function processImageFile(file: File, maxDimension = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المحدد ليس صورة صالحة. يرجى اختيار ملف صورة (JPG, PNG, WebP).'));
      return;
    }

    // التحقق من حجم الملف (حد أقصى 10 ميجابايت قبل الضغط)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('حجم الصورة كبير جداً (أكثر من 10 ميجابايت). يرجى اختيار صورة أصغر.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          // حساب الأبعاد الجديدة مع الحفاظ على النسبة والتناسب
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('تعذر معالجة الصورة في المتصفح.'));
            return;
          }

          // تحسين جودة التنعيم أثناء التصغير
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // تحويل الصورة إلى Data URL مضغوط بنوع JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          reject(new Error('حدث خطأ أثناء معالجة الصورة.'));
        }
      };

      img.onerror = () => {
        reject(new Error('تعذر قراءة ملف الصورة.'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('حدث خطأ أثناء قراءة الملف من جهازك.'));
    };

    reader.readAsDataURL(file);
  });
}
