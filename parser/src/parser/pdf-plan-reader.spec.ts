import { PDFPlanReader } from "./pdf-plan-reader";

describe("PDFPlanReader", () => {
  it("should parse empty", () => {
    const reader = new PDFPlanReader();
    const texts = reader.getTexts({ texts: [] });
    expect(texts.length).toEqual(0);
  });

  it("should parse german date notation", () => {
    const reader = new PDFPlanReader();
    const days = reader.getTexts({
      texts: [
        { R: [{ T: "02.03.2018" }], w: 0, x: 77, y: 6.8 },
        { R: [{ T: "GULASCH" }], w: 0, x: 1.95, y: 10.27 }
      ]
    });
    expect(days.length).toEqual(1);
    expect(days[0]).toEqual({
      name: "Montag",
      date: "2018-03-02",
      meals: [{ lines: ["GULASCH"] }]
    });
  });

  it("should parse iso date notation", () => {
    const reader = new PDFPlanReader();
    const days = reader.getTexts({
      texts: [
        { R: [{ T: "2018-03-02" }], w: 0, x: 77, y: 6.8 },
        { R: [{ T: "GULASCH" }], w: 0, x: 1.95, y: 10.27 }
      ]
    });
    expect(days.length).toEqual(1);
    expect(days[0]).toEqual({
      name: "Montag",
      date: "2018-03-02",
      meals: [{ lines: ["GULASCH"] }]
    });
  });
});
