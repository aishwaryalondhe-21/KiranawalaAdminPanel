import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { ReportData } from "@/types"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  const csvContent = convertToCSV(data)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  downloadBlob(blob, `${filename}.csv`)
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Escape commas and quotes
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(",")
  )

  return [headers.join(","), ...rows].join("\n")
}

export function exportReportToPDF(report: ReportData, storeName: string = "Store") {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text(`${storeName} - ${report.period.toUpperCase()} Report`, 14, 20)
  
  // Date range
  doc.setFontSize(12)
  doc.text(`Period: ${format(new Date(report.startDate), "MMM d, yyyy")} - ${format(new Date(report.endDate), "MMM d, yyyy")}`, 14, 30)
  doc.text(`Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}`, 14, 37)
  
  // Summary section
  doc.setFontSize(16)
  doc.text("Summary", 14, 50)
  
  const summaryData = [
    ["Metric", "Value"],
    ["Total Orders", report.summary.totalOrders.toString()],
    ["Total Revenue", formatCurrency(report.summary.totalRevenue)],
    ["Total Customers", report.summary.totalCustomers.toString()],
    ["Average Order Value", formatCurrency(report.summary.averageOrderValue)]
  ]
  
  autoTable(doc, {
    startY: 55,
    head: [summaryData[0]] as unknown as [string, string][],
    body: summaryData.slice(1) as unknown as [string, string][],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] }
  })
  
  // Top Products section
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 55
  doc.setFontSize(16)
  doc.text("Top Products", 14, finalY + 15)
  
  const topProductsData = [
    ["Product", "Category", "Units Sold", "Revenue"],
    ...report.topProducts.map(p => [
      p.name,
      p.category,
      p.totalSales.toString(),
      formatCurrency(p.totalRevenue)
    ])
  ]
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [topProductsData[0]] as unknown as [string, string, string, string][],
    body: topProductsData.slice(1) as unknown as [string, string, string, string][],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] }
  })
  
  // Category Breakdown
  const finalY2 = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || finalY + 20
  
  // Check if we need a new page
  if (finalY2 > 240) {
    doc.addPage()
    doc.setFontSize(16)
    doc.text("Category Breakdown", 14, 20)
    
    const categoryData = [
      ["Category", "Units Sold", "Revenue", "% of Total"],
      ...report.categoryBreakdown.map(c => [
        c.category,
        c.totalSales.toString(),
        formatCurrency(c.totalRevenue),
        `${c.percentage.toFixed(1)}%`
      ])
    ]
    
    autoTable(doc, {
      startY: 25,
      head: [categoryData[0]] as unknown as [string, string, string, string][],
      body: categoryData.slice(1) as unknown as [string, string, string, string][],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }
    })
  } else {
    doc.setFontSize(16)
    doc.text("Category Breakdown", 14, finalY2 + 15)
    
    const categoryData = [
      ["Category", "Units Sold", "Revenue", "% of Total"],
      ...report.categoryBreakdown.map(c => [
        c.category,
        c.totalSales.toString(),
        formatCurrency(c.totalRevenue),
        `${c.percentage.toFixed(1)}%`
      ])
    ]
    
    autoTable(doc, {
      startY: finalY2 + 20,
      head: [categoryData[0]] as unknown as [string, string, string, string][],
      body: categoryData.slice(1) as unknown as [string, string, string, string][],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }
    })
  }
  
  // Save PDF
  const filename = `${storeName.replace(/\s+/g, "_")}_${report.period}_report_${format(new Date(), "yyyy-MM-dd")}.pdf`
  doc.save(filename)
}

export function exportReportToCSV(report: ReportData, storeName: string = "Store") {
  // Summary CSV
  const summaryData = [
    { Metric: "Period", Value: report.period },
    { Metric: "Start Date", Value: report.startDate },
    { Metric: "End Date", Value: report.endDate },
    { Metric: "Total Orders", Value: report.summary.totalOrders },
    { Metric: "Total Revenue", Value: report.summary.totalRevenue },
    { Metric: "Total Customers", Value: report.summary.totalCustomers },
    { Metric: "Average Order Value", Value: report.summary.averageOrderValue.toFixed(2) }
  ]
  
  // Top Products CSV
  const topProductsData = report.topProducts.map(p => ({
    Product: p.name,
    Category: p.category,
    "Units Sold": p.totalSales,
    Revenue: p.totalRevenue.toFixed(2),
    "Order Count": p.orderCount
  }))
  
  // Category Breakdown CSV
  const categoryData = report.categoryBreakdown.map(c => ({
    Category: c.category,
    "Units Sold": c.totalSales,
    Revenue: c.totalRevenue.toFixed(2),
    "Order Count": c.orderCount,
    "Percentage": c.percentage.toFixed(2)
  }))
  
  // Combine all data
  const allData = [
    "SUMMARY",
    ...summaryData.map(d => `${d.Metric},${d.Value}`),
    "",
    "TOP PRODUCTS",
    convertToCSV(topProductsData),
    "",
    "CATEGORY BREAKDOWN",
    convertToCSV(categoryData)
  ].join("\n")
  
  const blob = new Blob([allData], { type: "text/csv;charset=utf-8;" })
  const filename = `${storeName.replace(/\s+/g, "_")}_${report.period}_report_${format(new Date(), "yyyy-MM-dd")}.csv`
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
