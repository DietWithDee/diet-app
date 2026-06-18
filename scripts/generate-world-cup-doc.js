import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import * as fs from "fs";

// Create the document
const doc = new Document({
    creator: "DietWithDee",
    title: "Surviving the Black Stars: Dee's Game-Day Guide to Keeping Your Blood Pressure Down",
    sections: [{
        properties: {
            page: {
                margin: {
                    top: 1440, // 1 inch
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                }
            }
        },
        children: [
            // Title
            new Paragraph({
                text: "Surviving the Black Stars: Dee’s Game-Day Guide to Keeping Your Blood Pressure Down",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 120 },
            }),
            
            // Subtitle / Author Info
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 360 },
                children: [
                    new TextRun({
                        text: "By Nana Ama Dwamena, Registered Dietitian & Founder of DietWithDee",
                        italics: true,
                        color: "16a34a", // Green
                        size: 24, // 12pt
                    })
                ]
            }),

            // Intro
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "If you are a Ghanaian football fan, you already know the drills. You don’t just watch a Black Stars match; you ",
                        size: 22,
                    }),
                    new TextRun({
                        text: "survive",
                        bold: true,
                        size: 22,
                    }),
                    new TextRun({
                        text: " it.",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "Between the 89th-minute counter-attacks, the controversial penalty calls, and the collective indomie-like twisting of our defense, watching our matches is a high-octane cardio event in itself. It is a well-known national fact: a Ghana match can give you high blood pressure, palpitations, and fits. We’ve all felt it—that sudden tightening in the chest, the pacing around the living room, and the silent prayers when the opposing striker enters our 18-yard box.",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "As a Registered Dietitian, I often preach about avoiding chronic stress. But I also know that telling a Ghanaian to \"just stay calm\" during a World Cup match is like telling a fish to stay dry. It’s not going to happen.",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 280 },
                children: [
                    new TextRun({
                        text: "So, since we cannot control what happens on the pitch, I am preparing my own body—and my kitchen—to survive the emotional rollercoaster. Here is my official Game-Day Survival Guide to keeping your blood pressure under control while cheering on the boys.",
                        size: 22,
                    })
                ]
            }),

            // Section 1
            new Paragraph({
                text: "1. Ditch the Salty Plantain Chips (The Sodium Bomb)",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
            }),

            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "When tension rises, we reach for crunchy snacks. The problem? Most commercial game-day snacks—like heavily salted plantain chips, roasted peanuts, or store-bought crisps—are packed with sodium. Sodium causes your body to hold onto water, putting extra pressure on your blood vessels. When you combine that with Black Stars-induced adrenaline, you are asking for a blood pressure spike.",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 240 },
                children: [
                    new TextRun({
                        text: "💡 Dee’s Prep: ",
                        bold: true,
                        color: "16a34a",
                        size: 22,
                    }),
                    new TextRun({
                        text: "I am preparing air-popped popcorn seasoned with a pinch of garlic powder and cayenne pepper (capsaicin helps dilate blood vessels!), or unsalted roasted cashews.",
                        size: 22,
                    })
                ]
            }),

            // Section 2
            new Paragraph({
                text: "2. Load Up on Potassium (The Natural BP Regulator)",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
            }),

            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "Potassium is the ultimate antidote to sodium. It relaxes the walls of your blood vessels and helps lower your blood pressure.",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 240 },
                children: [
                    new TextRun({
                        text: "💡 Dee’s Prep: ",
                        bold: true,
                        color: "16a34a",
                        size: 22,
                    }),
                    new TextRun({
                        text: "Two hours before kickoff, I’m blending a \"Heart-Defense Smoothie.\" It’s loaded with bananas, spinach, and coconut water. It keeps me hydrated and preps my system with a strong dose of potassium before the stress kicks in.",
                        size: 22,
                    })
                ]
            }),

            // Section 3
            new Paragraph({
                text: "3. Hydrate with Hibiscus (Sobolo to the Rescue!)",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
            }),

            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "Many fans reach for ice-cold beer or caffeinated energy drinks to get through the matches. But alcohol and caffeine both constrict blood vessels and increase heart rates—the exact opposite of what we want when the score is tied at 1-1 in extra time.",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 240 },
                children: [
                    new TextRun({
                        text: "💡 Dee’s Prep: ",
                        bold: true,
                        color: "16a34a",
                        size: 22,
                    }),
                    new TextRun({
                        text: "I am brewing a massive pitcher of unsweetened (or lightly honey-sweetened) ",
                        size: 22,
                    }),
                    new TextRun({
                        text: "Sobolo",
                        italics: true,
                        size: 22,
                    }),
                    new TextRun({
                        text: " (Hibiscus tea). Clinical studies show that hibiscus tea can significantly lower both systolic and diastolic blood pressure. Drink it chilled; it’s refreshing, anti-inflammatory, and acts as a natural relaxant.",
                        size: 22,
                    })
                ]
            }),

            // Section 4
            new Paragraph({
                text: "4. Master the \"90th-Minute Deep Breathe\"",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
            }),

            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "When we get anxious, our breathing becomes shallow, which triggers the sympathetic nervous system to increase heart rate and blood pressure.",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 360 },
                children: [
                    new TextRun({
                        text: "💡 Dee’s Prep: ",
                        bold: true,
                        color: "16a34a",
                        size: 22,
                    }),
                    new TextRun({
                        text: "If we concede a penalty or enter five minutes of added time, I use the ",
                        size: 22,
                    }),
                    new TextRun({
                        text: "4-7-8 breathing technique",
                        bold: true,
                        size: 22,
                    }),
                    new TextRun({
                        text: ". Inhale for 4 seconds, hold for 7, and exhale slowly for 8. It resets your nervous system instantly.",
                        size: 22,
                    })
                ]
            }),

            // Callout Box / Bordered Section for Father's Day
            new Paragraph({
                spacing: { before: 200, after: 100 },
                children: [
                    new TextRun({
                        text: "🎁 A Special Father’s Day Teaser 🎁",
                        bold: true,
                        color: "d97706", // Amber
                        size: 24,
                    })
                ],
                alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
                spacing: { after: 160 },
                children: [
                    new TextRun({
                        text: "Speaking of keeping blood pressure down—Father’s Day is just around the corner. If your dad is the type of fan who screams at the television, throws his hands in the air, and gets visible fits during Ghana matches, his heart needs some extra love.",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 160 },
                children: [
                    new TextRun({
                        text: "This Father's Day, we have prepared something incredibly special. Instead of gifting him another tie or cufflink, give him the gift of a healthy heart and customized wellness. We are launching our ",
                        size: 22,
                    }),
                    new TextRun({
                        text: "Father’s Day Premium Consultation Package",
                        bold: true,
                        size: 22,
                    }),
                    new TextRun({
                        text: " for just ",
                        size: 22,
                    }),
                    new TextRun({
                        text: "GH₵ 600",
                        bold: true,
                        color: "d97706",
                        size: 22,
                    }),
                    new TextRun({
                        text: " (a massive ₵400 savings!).",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "It includes a 45-minute comprehensive nutrition assessment, a customized heart-healthy diet plan, a beautiful downloadable gift voucher card you can print or share, and dedicated WhatsApp outreach (which we can keep as a surprise until Father’s Day morning!).",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "Keep an eye out on our website—the offer goes live soon. Let's make sure our dads stay healthy, happy, and ready for the next round of matches!",
                        size: 22,
                    })
                ]
            }),

            new Paragraph({
                spacing: { after: 120 },
                children: [
                    new TextRun({
                        text: "Go Black Stars! 🇬🇭⚽",
                        bold: true,
                        size: 24,
                    })
                ],
                alignment: AlignmentType.CENTER,
            }),
        ]
    }]
});

// Write file to disk
Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Surviving_the_Black_Stars_Game_Day_Guide.docx", buffer);
    console.log("SUCCESS: Created Surviving_the_Black_Stars_Game_Day_Guide.docx successfully!");
}).catch((err) => {
    console.error("ERROR generating docx file:", err);
});
