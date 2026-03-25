import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import Contract from '~/models/contractModel';
import { NotFoundError } from '~/utils/domainErrors';

interface BlockContent {
	type: string;
	text?: string;
	styles?: Record<string, unknown>;
}

interface Block {
	type: string;
	props?: Record<string, unknown>;
	content?: BlockContent[];
	children?: Block[];
}

function extractTextFromBlock(block: Block): string {
	return (block.content || [])
		.filter((c) => c.type === 'text' && c.text)
		.map((c) => c.text)
		.join('');
}

export async function downloadContract(id: string, userId: string, format: string): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
	const contract = await Contract.findOne({ _id: id, userId });
	if (!contract) throw new NotFoundError('Contract not found');

	const blocks = (contract.content || []) as unknown as Block[];
	const title = contract.title || 'Contract';

	switch (format) {
		case 'pdf':
			return generatePdf(title, blocks);
		case 'docx':
			return generateDocx(title, blocks);
		case 'md':
			return generateMarkdown(title, blocks);
		case 'html':
			return generateHtml(title, blocks);
		default:
			return generatePdf(title, blocks);
	}
}

async function generatePdf(title: string, blocks: Block[]): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ margin: 50 });
		const chunks: Buffer[] = [];

		doc.on('data', (chunk: Buffer) => chunks.push(chunk));
		doc.on('end', () => {
			const buffer = Buffer.concat(chunks);
			resolve({
				buffer,
				contentType: 'application/pdf',
				filename: `${title.replace(/[^a-zA-Z0-9\s]/g, '')}.pdf`
			});
		});
		doc.on('error', reject);

		doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
		doc.moveDown(2);

		for (const block of blocks) {
			const text = extractTextFromBlock(block);
			if (!text) continue;

			switch (block.type) {
				case 'heading': {
					const level = (block.props?.level as number) || 1;
					const fontSize = level === 1 ? 18 : level === 2 ? 15 : 13;
					doc.fontSize(fontSize).font('Helvetica-Bold').text(text);
					doc.moveDown(0.5);
					break;
				}
				case 'bulletListItem':
					doc.fontSize(11).font('Helvetica').text(`  •  ${text}`, { indent: 20 });
					doc.moveDown(0.3);
					break;
				case 'numberedListItem':
					doc.fontSize(11).font('Helvetica').text(`     ${text}`, { indent: 20 });
					doc.moveDown(0.3);
					break;
				default:
					doc.fontSize(11).font('Helvetica').text(text);
					doc.moveDown(0.5);
					break;
			}
		}

		doc.end();
	});
}

async function generateDocx(title: string, blocks: Block[]): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
	const children: Paragraph[] = [];

	children.push(
		new Paragraph({
			children: [new TextRun({ text: title, bold: true, size: 32 })],
			alignment: AlignmentType.CENTER,
			spacing: { after: 400 }
		})
	);

	for (const block of blocks) {
		const text = extractTextFromBlock(block);
		if (!text) continue;

		switch (block.type) {
			case 'heading': {
				const level = (block.props?.level as number) || 1;
				const headingLevel = level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
				children.push(
					new Paragraph({
						children: [new TextRun({ text, bold: true })],
						heading: headingLevel
					})
				);
				break;
			}
			case 'bulletListItem':
				children.push(
					new Paragraph({
						children: [new TextRun({ text })],
						bullet: { level: 0 }
					})
				);
				break;
			default:
				children.push(
					new Paragraph({
						children: [new TextRun({ text })],
						spacing: { after: 200 }
					})
				);
				break;
		}
	}

	const doc = new Document({
		sections: [{ children }]
	});

	const buffer = await Packer.toBuffer(doc);
	return {
		buffer: buffer as unknown as Buffer,
		contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		filename: `${title.replace(/[^a-zA-Z0-9\s]/g, '')}.docx`
	};
}

async function generateMarkdown(title: string, blocks: Block[]): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
	let md = `# ${title}\n\n`;

	for (const block of blocks) {
		const text = extractTextFromBlock(block);
		if (!text) continue;

		switch (block.type) {
			case 'heading': {
				const level = (block.props?.level as number) || 1;
				md += `${'#'.repeat(level + 1)} ${text}\n\n`;
				break;
			}
			case 'bulletListItem':
				md += `- ${text}\n`;
				break;
			case 'numberedListItem':
				md += `1. ${text}\n`;
				break;
			default:
				md += `${text}\n\n`;
				break;
		}
	}

	return {
		buffer: Buffer.from(md, 'utf-8'),
		contentType: 'text/markdown',
		filename: `${title.replace(/[^a-zA-Z0-9\s]/g, '')}.md`
	};
}

async function generateHtml(title: string, blocks: Block[]): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
	let body = '';

	for (const block of blocks) {
		const text = extractTextFromBlock(block);
		if (!text) continue;

		switch (block.type) {
			case 'heading': {
				const level = (block.props?.level as number) || 1;
				const tag = `h${Math.min(level + 1, 6)}`;
				body += `<${tag}>${escapeHtml(text)}</${tag}>\n`;
				break;
			}
			case 'bulletListItem':
				body += `<ul><li>${escapeHtml(text)}</li></ul>\n`;
				break;
			case 'numberedListItem':
				body += `<ol><li>${escapeHtml(text)}</li></ol>\n`;
				break;
			default:
				body += `<p>${escapeHtml(text)}</p>\n`;
				break;
		}
	}

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<style>
body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
h2 { margin-top: 30px; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${body}
</body>
</html>`;

	return {
		buffer: Buffer.from(html, 'utf-8'),
		contentType: 'text/html',
		filename: `${title.replace(/[^a-zA-Z0-9\s]/g, '')}.html`
	};
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export default { downloadContract };
