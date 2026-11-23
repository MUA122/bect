"""Arabic project facts in the order used by the print spread and mobile reader."""


def metadata_rows(data, number):
    return [
        [("الموقع · ١٣ منطقة" if number == 15 else "الموقع", data["location"])],
        [("العميل", data["client"])],
        [(data["completionLabel"], data["completion"]), ("القيمة التقديرية", data["value"])],
        [("التخصصات", "، ".join(data["disciplines"]))],
    ]
