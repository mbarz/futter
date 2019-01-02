export class DayListContainer {
  private constructor(public container: JQuery<HTMLElement>) {}

  static create() {
    const daysContainer = $("#plan");
    (<any>daysContainer).mousewheel((event: Event, delta: number) => {
      const totalHeight = daysContainer.get(0).scrollHeight;
      if (totalHeight < (daysContainer.height() || totalHeight) + 21) {
        const current = daysContainer.scrollLeft() || 0;
        daysContainer.scrollLeft(current - delta * 30);
        event.preventDefault();
      }
    });
    return new DayListContainer(daysContainer);
  }

  clear() {
    this.container.empty();
  }

  append(div: any) {
    this.container.append(div);
  }

  public scrollTo(container: JQuery<HTMLElement>) {
    const offset = container.offset();
    const containerOffset = this.container.offset();
    if (offset && containerOffset) {
      const paddingLeft = parseInt(
        this.container.css("padding-left").replace("px", "")
      );
      const paddingTop = parseInt(
        this.container.css("padding-top").replace("px", "")
      );
      const left = offset.left - containerOffset.left - paddingLeft;
      const top = offset.top - containerOffset.top - paddingTop;
      const currentLeft = this.container.scrollLeft() || 0;
      const currentTop = this.container.scrollTop() || 0;
      this.container.scrollLeft(currentLeft + left);
      this.container.scrollTop(currentTop + top);
    }
  }
}
